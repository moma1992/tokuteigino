import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import Header from './components/Header';
import Home from './pages/Home';
import Study from './pages/Study';
import Practice from './pages/Practice';
import Profile from './pages/Profile';
import { TestSupabase } from './pages/TestSupabase';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { ConfirmEmail } from './pages/ConfirmEmail';
import { EmailConfirmationPending } from './pages/EmailConfirmationPending';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", "Noto Sans JP", sans-serif',
  },
});

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  console.log('App component rendering');

  // Test mode for E2E tests - enable real auth but with faster timeouts
  const isTestMode = window.location.search.includes('test=true') || 
                     window.localStorage.getItem('e2e-test-mode') === 'true';

  // アプリ起動時に認証状態をチェック
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 認証チェック中はローディング画面を表示 (shorter timeout in test mode)
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            TOKUTEI Learning
          </Typography>
          <Typography variant="body2" color="text.secondary">
            読み込み中...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Header />
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              {/* 公開ページ */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/confirm" element={<ConfirmEmail />} />
              <Route path="/email-confirmation-pending" element={<EmailConfirmationPending />} />
              <Route path="/test-supabase" element={<TestSupabase />} />
              
              {/* 認証が必要なページ */}
              <Route 
                path="/study" 
                element={
                  <ProtectedRoute>
                    <Study />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/practice" 
                element={
                  <ProtectedRoute>
                    <Practice />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
