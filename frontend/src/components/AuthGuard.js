import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const isAuthenticated = () => {
  // Replace with your real authentication logic (e.g., check token in localStorage)
  return !!localStorage.getItem('token');
};

const AuthGuard = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;