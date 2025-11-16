// Calendar Component for Session Booking
// Displays available sessions and allows clients to book

import { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { sessionAPI } from '../services/api';

export default function Calendar({ remainingCredits, onBookingComplete }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableSessions();
  }, [selectedDate]);

  const loadAvailableSessions = async () => {
    try {
      const response = await sessionAPI.getAvailable();
      setAvailableSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const getSessionsForDate = (date) => {
    const dateStr = date.toDateString();
    return availableSessions.filter(session => {
      const sessionDate = new Date(session.dateTime);
      return sessionDate.toDateString() === dateStr && !session.isBooked;
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleBookSession = async (session) => {
    if (remainingCredits <= 0) {
      alert('You have no remaining credits. Please contact your coach.');
      return;
    }

    if (!confirm('Book this session? This will be pending coach approval.')) {
      return;
    }

    setLoading(true);
    try {
      await sessionAPI.bookSession(session.id);
      alert('Booking request sent! Awaiting coach approval.');
      setSelectedSession(null);
      await loadAvailableSessions();
      if (onBookingComplete) onBookingComplete();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const sessionsForSelectedDate = getSessionsForDate(selectedDate);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const sessions = getSessionsForDate(date);
      if (sessions.length > 0) {
        return 'has-sessions';
      }
    }
    return null;
  };

  return (
    <div>
      <style>{`
        .has-sessions {
          background-color: #e0f2fe !important;
          font-weight: bold;
        }
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .react-calendar__tile--active {
          background: #0ea5e9 !important;
          color: white;
        }
        .react-calendar__tile--hover {
          background: #f0f9ff;
        }
      `}</style>

      <ReactCalendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
        minDate={new Date()}
        className="mb-6 shadow-sm rounded-lg"
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Available Sessions for {selectedDate.toLocaleDateString()}
        </h3>

        {sessionsForSelectedDate.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No available sessions for this date</p>
        ) : (
          <div className="space-y-2">
            {sessionsForSelectedDate.map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(session.dateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{session.duration} minutes</p>
                </div>
                <button
                  onClick={() => handleBookSession(session)}
                  disabled={loading || remainingCredits <= 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}