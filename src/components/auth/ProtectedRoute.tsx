import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: 'customer' | 'admin' | 'employee' | 'sales_rep';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireRole
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!user) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin requirement
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for specific role requirement
  if (requireRole && user.role !== requireRole) {
    // Special handling for sales_rep role
    if (requireRole === 'sales_rep') {
      // Check if user has sales_rep flag or is in sales_reps table
      // This would need to be added to the user object from backend
      const isSalesRep = user.role === 'employee' && (user as any).is_sales_rep;
      if (!isSalesRep) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
