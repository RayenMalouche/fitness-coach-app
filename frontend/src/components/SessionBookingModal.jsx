// Session Management Component for Coach
// Create available sessions and manage bookings

import { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';

export default function SessionManagement() {
  const [availableSessions, setAvailableSessions] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    dateTime: '',
    duration: 60
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, bookingsRes] = await Promise.all([
        sessionAPI.getAvailable(),
        sessionAPI.getPendingBookings()
      ]);
      setAvailableSessions(sessionsRes.data.sessions);
      setPendingBookings(bookingsRes.data.bookings);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.createAvailable(newSession);
      setNewSession({ dateTime: '', duration: 60 });
      setShowCreateForm(false);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create session');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await sessionAPI.approveBooking(bookingId);
      await loadData();
    } catch (error) {
      alert('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await sessionAPI.rejectBooking(bookingId);
      await loadData();
    } catch (error) {
      alert('Failed to reject booking');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Delete this session?')) return;
    try {
      await sessionAPI.deleteSession(sessionId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete session');
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Bookings</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.client.name}</div>
                      <div className="text-sm text-gray-500">{booking.client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.session.dateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleApproveBooking(booking.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Session Form */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Available Sessions</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            {showCreateForm ? 'Cancel' : '+ Create Session'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateSession} className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newSession.dateTime}
                  onChange={(e) => setNewSession({ ...newSession, dateTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Create Session
            </button>
          </form>
        )}

        {/* Sessions List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableSessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(session.dateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      session.isBooked 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!session.isBooked && (
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}