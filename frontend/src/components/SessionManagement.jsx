// Heats: the sessions a coach opens, laid out as a start list by day, with the
// bookings still waiting for the starter's approval at the top.

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { useAnnouncer } from './track/announcer'
import { SectionHead } from './track/app-shell'
import { Bib } from './track/bib'
import { sessionAPI } from '../services/api'
import { clock, day, dayLong, errorText } from '../lib/format'

export default function SessionManagement({ onChange }) {
  const announce = useAnnouncer()
  const [availableSessions, setAvailableSessions] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSession, setNewSession] = useState({ dateTime: '', duration: 60 })

  const loadData = async () => {
    try {
      const [sessionsRes, bookingsRes] = await Promise.all([sessionAPI.getAvailable(), sessionAPI.getPendingBookings()])
      setAvailableSessions(sessionsRes.data.sessions)
      setPendingBookings(bookingsRes.data.bookings)
    } catch (error) {
      console.error('Failed to load data:', error)
      announce('Could not load the heats', 'stop')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const refresh = async () => {
    await loadData()
    onChange?.()
  }

  const run = async (action, success, failure, tone) => {
    try {
      await action()
      announce(success, tone)
      await refresh()
    } catch (error) {
      announce(errorText(error, failure), 'stop')
    }
  }

  const handleCreateSession = (e) => {
    e.preventDefault()
    run(
      async () => {
        await sessionAPI.createAvailable(newSession)
        setNewSession({ dateTime: '', duration: 60 })
        setShowCreateForm(false)
      },
      'Heat opened',
      'Could not open heat',
    )
  }

  const handleDeleteSession = (session) => {
    if (!confirm(`Remove the ${clock(session.dateTime)} heat on ${day(session.dateTime)}?`)) return
    run(() => sessionAPI.deleteSession(session.id), 'Heat removed', 'Could not remove heat', 'flag')
  }

  // Group the start list by day.
  const byDay = availableSessions
    .slice()
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .reduce((groups, s) => {
      const key = new Date(s.dateTime).toDateString()
      ;(groups[key] ??= []).push(s)
      return groups
    }, {})

  return (
    <div className="space-y-12">
      {pendingBookings.length > 0 && (
        <section>
          <SectionHead kicker="Yellow flag" title={`Awaiting the starter · ${pendingBookings.length}`} />
          <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10 bg-lane">
            {pendingBookings.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
                <Bib id={booking.client.id ?? booking.clientId} size="sm" />
                <div className="min-w-[11rem] flex-1">
                  <p className="font-semibold">{booking.client.name}</p>
                  <p className="font-mono text-sm text-cinder">
                    {day(booking.session.dateTime)} · {clock(booking.session.dateTime)}
                  </p>
                </div>
                <div className="flex gap-5">
                  <button type="button" onClick={() => run(() => sessionAPI.approveBooking(booking.id), `${booking.client.name} is in the heat — one lap used`, 'Could not approve booking')} className="act-go">
                    Approve
                  </button>
                  <button type="button" onClick={() => run(() => sessionAPI.rejectBooking(booking.id), 'Booking declined — heat reopened', 'Could not decline booking', 'flag')} className="act-dq">
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHead kicker="Start list" title="Heats">
          <button type="button" onClick={() => setShowCreateForm(!showCreateForm)} className={showCreateForm ? 'btn-ghost' : 'btn-go'}>
            {showCreateForm ? 'Cancel' : (
              <>
                <Plus className="h-5 w-5" aria-hidden /> Open a heat
              </>
            )}
          </button>
        </SectionHead>

        {showCreateForm && (
          <form onSubmit={handleCreateSession} className="mb-8 grid gap-4 bg-lane p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
            <label>
              <span className="label mb-2 block !text-ink">Gun time</span>
              <input
                type="datetime-local"
                value={newSession.dateTime}
                onChange={(e) => setNewSession({ ...newSession, dateTime: e.target.value })}
                className="field"
                required
              />
            </label>
            <label>
              <span className="label mb-2 block !text-ink">Minutes</span>
              <input
                type="number"
                min="15"
                step="15"
                value={newSession.duration}
                onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value, 10) })}
                className="field"
                required
              />
            </label>
            <button type="submit" className="btn-go">
              Open heat
            </button>
          </form>
        )}

        {availableSessions.length === 0 ? (
          <p className="border-2 border-dashed border-ink/15 px-6 py-10 text-center text-cinder">No heats scheduled. Open one so athletes can book.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(byDay).map(([key, sessions]) => (
              <div key={key}>
                <h3 className="mb-2 font-display text-xl uppercase tracking-wide">{dayLong(sessions[0].dateTime)}</h3>
                <ol className="divide-y divide-ink/10 border-y-2 border-ink bg-lane">
                  {sessions.map((session, i) => (
                    <li key={session.id} className="grid grid-cols-[1.75rem_6rem_1fr_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[3rem_7rem_6rem_1fr_auto] sm:px-4">
                      <span className="font-display text-2xl text-cinder">{i + 1}</span>
                      <span className="whitespace-nowrap font-mono text-lg tabular-nums">{clock(session.dateTime)}</span>
                      <span className="hidden font-mono text-sm text-cinder sm:block">{session.duration} min</span>
                      <span>
                        {session.isBooked ? (
                          <span className="inline-flex items-center gap-2 text-sm font-semibold">
                            <span className="h-2.5 w-2.5 bg-ink" aria-hidden /> Taken
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-infield">
                            <span className="h-2.5 w-2.5 bg-infield" aria-hidden /> Open lane
                          </span>
                        )}
                      </span>
                      <span className="text-right">
                        {!session.isBooked && (
                          <button type="button" onClick={() => handleDeleteSession(session)} className="act-dq">
                            Remove
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
