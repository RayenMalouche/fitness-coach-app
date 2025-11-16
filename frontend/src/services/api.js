// API Service Layer
// Centralized API calls with authentication

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// Client API
export const clientAPI = {
  getAll: () => api.get('/clients'),
  getById: (clientId) => api.get(`/clients/${clientId}`),
  approve: (clientId) => api.post(`/clients/${clientId}/approve`),
  reject: (clientId) => api.delete(`/clients/${clientId}/reject`),
  updateCredits: (clientId, totalCredits) =>
    api.put(`/clients/${clientId}/credits`, { totalCredits }),
  getCredits: (clientId) => api.get(`/clients/${clientId}/credits`),
  getMyCredits: () => api.get('/clients/my/credits')
};

// Session API
export const sessionAPI = {
  createAvailable: (data) => api.post('/sessions/available', data),
  getAvailable: (params) => api.get('/sessions/available', { params }),
  deleteSession: (sessionId) => api.delete(`/sessions/available/${sessionId}`),
  bookSession: (sessionId) => api.post(`/sessions/${sessionId}/book`),
  getMyBookings: () => api.get('/sessions/bookings/my'),
  getClientBookings: (clientId) => api.get(`/sessions/bookings/client/${clientId}`),
  getPendingBookings: () => api.get('/sessions/bookings/pending'),
  approveBooking: (bookingId) => api.post(`/sessions/bookings/${bookingId}/approve`),
  rejectBooking: (bookingId) => api.post(`/sessions/bookings/${bookingId}/reject`)
};

// Meal API
export const mealAPI = {
  create: (data) => api.post('/meals', data),
  getMyMeals: (params) => api.get('/meals/my', { params }),
  getClientMeals: (clientId, params) => api.get(`/meals/client/${clientId}`, { params }),
  getTodaysMeals: () => api.get('/meals/today'),
  getById: (mealId) => api.get(`/meals/${mealId}`),
  update: (mealId, data) => api.put(`/meals/${mealId}`, data),
  delete: (mealId) => api.delete(`/meals/${mealId}`)
};

// Photo API
export const photoAPI = {
  upload: (formData) => api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyPhotos: () => api.get('/photos/my'),
  getClientPhotos: (clientId) => api.get(`/photos/client/${clientId}`),
  getAllPhotos: () => api.get('/photos/all'),
  getById: (photoId) => api.get(`/photos/${photoId}`),
  delete: (photoId) => api.delete(`/photos/${photoId}`)
};

export default api;