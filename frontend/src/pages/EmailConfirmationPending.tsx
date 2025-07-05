import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Button
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';

export const EmailConfirmationPending: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Email color="primary" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            メール確認
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            確認メールを送信しました
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>{email}</strong> にメール確認リンクを送信しました。
          </Typography>
          <Typography variant="body2">
            メールボックスを確認し、確認リンクをクリックしてアカウントを有効化してください。
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            次の手順：
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                メールボックス（迷惑メールフォルダも含む）を確認してください
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                「TOKUTEI Learning - メールアドレスの確認」という件名のメールを探してください
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                メール内の確認リンクをクリックしてください
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                確認完了後、自動的にログインされます
              </Typography>
            </li>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>注意：</strong>確認リンクの有効期限は24時間です。
            メールが届かない場合は、メールアドレスを確認して再度登録してください。
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
          >
            ログインページへ
          </Button>
          <Button
            component={Link}
            to="/signup"
            variant="contained"
          >
            別のメールで登録
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};