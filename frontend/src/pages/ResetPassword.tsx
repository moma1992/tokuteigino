import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

export const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { resetPassword, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      // エラーはストアで管理されるため、ここでは何もしない
    }
  };

  if (isSubmitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              送信完了
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              パスワードリセットのメールを送信しました。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              メール内のリンクをクリックして、新しいパスワードを設定してください。
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              startIcon={<ArrowBack />}
            >
              ログインページに戻る
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            パスワードリセット
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登録済みのメールアドレスを入力してください
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'メール送信に失敗しました'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
            size="large"
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'リセットメールを送信'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              component={Link}
              to="/login"
              variant="text"
              startIcon={<ArrowBack />}
            >
              ログインページに戻る
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};