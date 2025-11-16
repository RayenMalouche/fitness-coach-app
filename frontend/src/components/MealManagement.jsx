// Meal Management Component for Coach
// Create and assign meal plans to clients

import { useState, useEffect } from 'react';
import { mealAPI, clientAPI } from '../services/api';

export default function MealManagement() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [meals, setMeals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeal, setNewMeal] = useState({
    title: '',
    description: '',
    assignedDate: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientMeals();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const response = await clientAPI.getAll();
      const approved = response.data.clients.filter(c => c.approved);
      setClients(approved);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadClientMeals = async () => {
    try {
      const response = await mealAPI.getClientMeals(selectedClient);
      setMeals(response.data.meals);
    } catch (error) {
      console.error('Failed to load meals:', error);
    }
  };

  const handleCreateMeal = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }

    try {
      await mealAPI.create({
        ...newMeal,
        clientId: selectedClient
      });
      setNewMeal({ title: '', description: '', assignedDate: '' });
      setShowCreateForm(false);
      await loadClientMeals();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create meal');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!confirm('Delete this meal plan?')) return;
    try {
      await mealAPI.delete(mealId);
      await loadClientMeals();
    } catch (error) {
      alert('Failed to delete meal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <div className="bg-white rounded-xl shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">-- Choose a client --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Create Meal Form */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Meal Plans</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {showCreateForm ? 'Cancel' : '+ Create Meal Plan'}
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateMeal} className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Title
                    </label>
                    <input
                      type="text"
                      value={newMeal.title}
                      onChange={(e) => setNewMeal({ ...newMeal, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Protein-Rich Breakfast"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newMeal.description}
                      onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Meal details, ingredients, portions..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Date
                    </label>
                    <input
                      type="date"
                      value={newMeal.assignedDate}
                      onChange={(e) => setNewMeal({ ...newMeal, assignedDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Create Meal Plan
                </button>
              </form>
            )}
          </div>

          {/* Meals List */}
          <div className="bg-white rounded-xl shadow p-6">
            {meals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No meals assigned yet</p>
            ) : (
              <div className="space-y-4">
                {meals.map((meal) => (
                  <div key={meal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{meal.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>📅</span>
                          <span className="ml-2">
                            {new Date(meal.assignedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}