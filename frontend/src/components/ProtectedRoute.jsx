import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ fontSize: '16px', color: '#555' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If admin is allowed or specific role
    if (requiredRole === 'ROLE_ADMIN' && user?.role !== 'ROLE_ADMIN') {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === 'ROLE_DELIVERY_PARTNER' && user?.role !== 'ROLE_DELIVERY_PARTNER') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
