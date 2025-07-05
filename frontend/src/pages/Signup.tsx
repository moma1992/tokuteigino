import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { useAuthStore } from '../store/authStore';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student' as 'student' | 'teacher'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { signup, isLoading, error, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Handle successful signup or email confirmation
  useEffect(() => {
    console.log('Signup useEffect triggered:', { isAuthenticated, user: !!user, error, errorType: error?.type });
    
    if (error && error.type === 'email_confirmation_required') {
      // Redirect to email confirmation pending page
      console.log('Redirecting to email confirmation page');
      navigate('/email-confirmation-pending', { 
        state: { email: formData.email } 
      });
    } else if (isAuthenticated && user && !error) {
      console.log('Signup successful, redirecting to home...');
      navigate('/');
    }
  }, [isAuthenticated, user, error, navigate, formData.email]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード確認を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (!formData.fullName) {
      newErrors.fullName = '氏名を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('Form submitted with data:', {
      email: formData.email,
      role: formData.role,
      fullName: formData.fullName
    });

    await signup({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role
    });
  };


  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            新規登録
          </Typography>
          <Typography variant="body2" color="text.secondary">
            TOKUTEI Learning のアカウントを作成してください
          </Typography>
        </Box>

        {error && error.type !== 'email_confirmation_required' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || '登録に失敗しました'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="氏名"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName}
            margin="normal"
            autoComplete="name"
            autoFocus
          />

          <TextField
            fullWidth
            label="メールアドレス"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            autoComplete="email"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>役割</InputLabel>
            <Select
              value={formData.role}
              onChange={handleChange('role')}
              label="役割"
            >
              <MenuItem value="student">学生</MenuItem>
              <MenuItem value="teacher">教師</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="パスワード"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            autoComplete="new-password"
          />

          <TextField
            fullWidth
            label="パスワード確認"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            margin="normal"
            autoComplete="new-password"
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
              'アカウント作成'
            )}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              すでにアカウントをお持ちの方は
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              fullWidth
            >
              ログイン
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};