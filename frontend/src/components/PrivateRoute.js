import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children }) => {
    const auth = useAuth(); // Get whole auth object instead of destructuring
  
    if (auth.loading) {
      return <div>Loading...</div>;
    }
  
    return auth.user ? children : <Navigate to="/login" />;
  };