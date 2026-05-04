import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFleet } from '../../context/FleetContext';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useFleet();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
