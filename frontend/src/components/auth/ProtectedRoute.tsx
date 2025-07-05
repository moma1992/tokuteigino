import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { Box, CircularProgress } from '@mui/material';
import { UserRole } from '../../types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  unauthorizedRedirect?: string;
  loadingComponent?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/login',
  unauthorizedRedirect = '/unauthorized',
  loadingComponent,
}) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { canAccess } = useRoleAccess();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <CircularProgress />
            <Box ml={2}>Loading...</Box>
          </Box>
        )}
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  const hasAccess = canAccess({
    requiredRole,
    allowedRoles,
  });

  if (!hasAccess) {
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  return <>{children}</>;
};