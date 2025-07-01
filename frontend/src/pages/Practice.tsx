import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { Quiz } from '@mui/icons-material';

const Practice: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Quiz sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          練習問題
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          AI生成による個別最適化された問題で実力を向上させましょう
        </Typography>
        <Button variant="contained" size="large">
          練習を開始
        </Button>
      </Paper>
    </Box>
  );
};

export default Practice;