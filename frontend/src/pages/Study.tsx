import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { School } from '@mui/icons-material';

const Study: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          学習コース
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          体系的な学習コンテンツで特定技能試験に向けた準備を進めましょう
        </Typography>
        <Button variant="contained" size="large">
          コース一覧を見る
        </Button>
      </Paper>
    </Box>
  );
};

export default Study;