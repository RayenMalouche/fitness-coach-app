// Coach Dashboard Component
// Main dashboard for coaches with tabs for different features

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClientList from '../components/ClientList';
import SessionManagement from '../components/SessionManagement';
import MealManagement from '../components/MealManagement';
import PhotoGallery from '../components/PhotoGallery';

export default function CoachDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('clients');

  const tabs = [
    { id: 'clients', name: 'Clients', icon: '👥' },
    { id: 'sessions', name: 'Sessions', icon: '📅' },
    { id: 'meals', name: 'Meal Plans', icon: '🍽️' },
    { id: 'photos', name: 'Client Photos', icon: '📸' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'clients' && <ClientList />}
          {activeTab === 'sessions' && <SessionManagement />}
          {activeTab === 'meals' && <MealManagement />}
          {activeTab === 'photos' && <PhotoGallery />}
        </div>
      </div>
    </div>
  );
}