import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { Person } from '@mui/icons-material';

const Profile: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Person sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          プロフィール
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          学習進捗と設定を管理しましょう
        </Typography>
        <Button variant="contained" size="large">
          詳細を確認
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile;