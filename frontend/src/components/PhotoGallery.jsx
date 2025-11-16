// Photo Gallery Component for Coach
// View all photos uploaded by clients

import { useState, useEffect } from 'react';
import { photoAPI, clientAPI } from '../services/api';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [selectedClient]);

  const loadData = async () => {
    try {
      const response = await clientAPI.getAll();
      const approved = response.data.clients.filter(c => c.approved);
      setClients(approved);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      let response;
      if (selectedClient === 'all') {
        response = await photoAPI.getAllPhotos();
      } else {
        response = await photoAPI.getClientPhotos(selectedClient);
      }
      setPhotos(response.data.photos);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await photoAPI.delete(photoId);
      await loadPhotos();
    } catch (error) {
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading photos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Client Filter */}
      <div className="bg-white rounded-xl shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Photo Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Client Photos ({photos.length})
        </h2>
        {photos.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">No photos uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                <img
                  src={`${API_BASE}${photo.imageUrl}`}
                  alt="Client meal"
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {photo.client.name}
                    </span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  {photo.caption && (
                    <p className="text-sm text-gray-600 mb-2">{photo.caption}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(photo.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}