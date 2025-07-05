import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login({ email, password });
      navigate('/'); // ログイン成功後はホームページにリダイレクト
    } catch (err) {
      // エラーはストアで管理されるため、ここでは何もしない
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ログイン
          </Typography>
          <Typography variant="body2" color="text.secondary">
            TOKUTEI Learning にログインしてください
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'ログインに失敗しました'}
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

          <TextField
            fullWidth
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            autoComplete="current-password"
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
              'ログイン'
            )}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              アカウントをお持ちでない方は
            </Typography>
            <Button
              component={Link}
              to="/signup"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            >
              新規登録
            </Button>
            
            <Button
              component={Link}
              to="/reset-password"
              variant="text"
              size="small"
            >
              パスワードを忘れた方はこちら
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};