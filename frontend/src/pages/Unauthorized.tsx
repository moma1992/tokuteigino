import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Lock } from '@mui/icons-material';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Lock sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography component="h1" variant="h4" gutterBottom>
            アクセス権限がありません
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            申し訳ございません。このページを表示する権限がありません。
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              前のページに戻る
            </Button>
            
            <Button
              variant="contained"
              onClick={() => navigate('/')}
            >
              ホームに戻る
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};