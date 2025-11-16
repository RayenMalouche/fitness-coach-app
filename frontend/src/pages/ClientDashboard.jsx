// Client Dashboard Component
// Main dashboard for clients with approval status and features

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clientAPI, sessionAPI, mealAPI } from '../services/api';
import Calendar from '../components/Calendar';
import MealCard from '../components/MealCard';
import PhotoUpload from '../components/PhotoUpload';

export default function ClientDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [credits, setCredits] = useState(null);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.approved) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [creditsRes, mealsRes, bookingsRes] = await Promise.all([
        clientAPI.getMyCredits(),
        mealAPI.getTodaysMeals(),
        sessionAPI.getMyBookings()
      ]);

      setCredits(creditsRes.data);
      setTodaysMeals(mealsRes.data.meals);
      setMyBookings(bookingsRes.data.bookings);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // If not approved, show pending message
  if (!user?.approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h2>
          <p className="text-gray-600 mb-6">
            Your account is awaiting approval from your coach. You'll receive access to all features once approved.
          </p>
          <button
            onClick={logout}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credits Card */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <h3 className="text-lg font-semibold mb-2">Session Credits</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">{credits?.remainingCredits || 0}</span>
            <span className="text-xl ml-2 opacity-90">/ {credits?.totalCredits || 0}</span>
          </div>
          <p className="text-sm opacity-90 mt-2">
            {credits?.usedCredits || 0} sessions completed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Book Sessions</h2>
            <Calendar
              remainingCredits={credits?.remainingCredits || 0}
              onBookingComplete={loadDashboardData}
            />
          </div>

          {/* Meals & Photos Section */}
          <div className="space-y-8">
            {/* Today's Meals */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Meals</h2>
              {todaysMeals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No meals assigned for today</p>
              ) : (
                <div className="space-y-4">
                  {todaysMeals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Track Your Meals</h2>
              <PhotoUpload />
            </div>
          </div>
        </div>

        {/* My Bookings */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h2>
          {myBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(booking.session.dateTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}