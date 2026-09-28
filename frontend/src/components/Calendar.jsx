// Booking: a month of race days (days with open heats are marked), then the
// open heats on the chosen day. Booking one asks the coach to approve it.

import { useEffect, useState } from 'react'
import ReactCalendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

import { useAnnouncer } from './track/announcer'
import { sessionAPI } from '../services/api'
import { clock, dayLong, errorText } from '../lib/format'

export default function Calendar({ remainingCredits, onBookingComplete }) {
  const announce = useAnnouncer()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSessions, setAvailableSessions] = useState([])
  const [bookingId, setBookingId] = useState(null)

  const loadAvailableSessions = async () => {
    try {
      const response = await sessionAPI.getAvailable()
      setAvailableSessions(response.data.sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  useEffect(() => {
    loadAvailableSessions()
  }, [])

  const openOn = (date) =>
    availableSessions
      .filter((s) => new Date(s.dateTime).toDateString() === date.toDateString() && !s.isBooked)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))

  const handleBookSession = async (session) => {
    if (remainingCredits <= 0) return announce('No laps left — ask your coach for more', 'stop')
    setBookingId(session.id)
    try {
      await sessionAPI.bookSession(session.id)
      announce('Booked — waiting for your coach to approve', 'flag')
      await loadAvailableSessions()
      onBookingComplete?.()
    } catch (error) {
      announce(errorText(error, 'Could not book that heat'), 'stop')
    } finally {
      setBookingId(null)
    }
  }

  const heats = openOn(selectedDate)

  return (
    <div className="track-calendar">
      <style>{`
        .track-calendar .react-calendar { width: 100%; border: 0; background: transparent; font-family: inherit; }
        .track-calendar .react-calendar__navigation button { font-family: Anton, Impact, sans-serif; font-size: 1.25rem; text-transform: uppercase; letter-spacing: 0.03em; }
        .track-calendar .react-calendar__month-view__weekdays abbr { text-decoration: none; font-family: "Chivo Mono", monospace; font-size: 0.65rem; color: #6B6660; }
        .track-calendar .react-calendar__tile { position: relative; padding: 0.8em 0.2em; font-family: "Chivo Mono", monospace; border-radius: 0; }
        .track-calendar .react-calendar__tile:enabled:hover { background: #fff; }
        .track-calendar .react-calendar__tile--now { background: transparent; box-shadow: inset 0 -3px 0 #16181B; }
        .track-calendar .react-calendar__tile--active,
        .track-calendar .react-calendar__tile--active:enabled:hover,
        .track-calendar .react-calendar__tile--active:enabled:focus { background: #16181B; color: #fff; }
        .track-calendar .has-heats::after { content: ''; position: absolute; left: 50%; bottom: 0.35em; width: 1.2em; height: 3px; margin-left: -0.6em; background: #C9472E; }
        .track-calendar .react-calendar__tile:disabled { background: transparent; color: #6B666066; }
      `}</style>

      <ReactCalendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date, view }) => (view === 'month' && openOn(date).length ? 'has-heats' : null)}
        minDate={new Date()}
      />

      <div className="mt-6">
        <h3 className="font-display text-xl uppercase tracking-wide">{dayLong(selectedDate)}</h3>
        {heats.length === 0 ? (
          <p className="mt-2 text-cinder">No open heats this day. Days with a red bar have some.</p>
        ) : (
          <ol className="mt-3 divide-y divide-ink/10 border-y-2 border-ink">
            {heats.map((session, i) => (
              <li key={session.id} className="flex items-center gap-4 py-3">
                <span className="w-6 font-display text-xl text-cinder">{i + 1}</span>
                <span className="whitespace-nowrap font-mono text-lg tabular-nums">{clock(session.dateTime)}</span>
                <span className="flex-1 font-mono text-sm text-cinder">{session.duration} min</span>
                <button
                  type="button"
                  onClick={() => handleBookSession(session)}
                  disabled={bookingId != null || remainingCredits <= 0}
                  className="btn-go px-4 py-2 text-base"
                >
                  {bookingId === session.id ? 'Booking…' : 'Book'}
                </button>
              </li>
            ))}
          </ol>
        )}
        {remainingCredits <= 0 && <p className="mt-3 text-sm text-cinder">You have no laps left. Your coach can add more.</p>}
      </div>
    </div>
  )
}
