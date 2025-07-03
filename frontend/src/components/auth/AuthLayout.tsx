import React from 'react'
import { Box, Container, Paper, Typography } from '@mui/material'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      data-testid="auth-layout"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm" data-testid="auth-container">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box data-testid="auth-header" sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              TOKUTEI Learning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              特定技能試験学習支援
            </Typography>
          </Box>
          
          <Box data-testid="auth-content" sx={{ width: '100%' }}>
            {children}
          </Box>
          
          <Box data-testid="auth-footer" sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 TOKUTEI Learning
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}