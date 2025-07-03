import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Box, CircularProgress } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return (
      <div data-testid="redirect-login">
        <Navigate to="/login" state={{ from: location }} replace />
        Please login first
      </div>
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}