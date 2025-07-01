import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Header from './components/Header';
import Home from './pages/Home';
import Study from './pages/Study';
import Practice from './pages/Practice';
import Profile from './pages/Profile';

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Header />
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/study" element={<Study />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
