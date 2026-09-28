// Main App Component
// Handles routing and authentication flow

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CoachDashboard from './pages/CoachDashboard';
import ClientDashboard from './pages/ClientDashboard';
import { AnnouncerProvider } from './components/track/announcer';
import { Loading } from './components/track/app-shell';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home Route - Redirects based on user role
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'COACH') {
    return <Navigate to="/coach" replace />;
  }

  return <Navigate to="/client" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/coach/*"
          element={
            <ProtectedRoute requireRole="COACH">
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/client/*"
          element={
            <ProtectedRoute requireRole="CLIENT">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AnnouncerProvider>
        <AppRoutes />
      </AnnouncerProvider>
    </AuthProvider>
  );
}

export default App;