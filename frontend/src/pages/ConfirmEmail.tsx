import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!token_hash || type !== 'email') {
        setStatus('error');
        setMessage('無効な確認リンクです。');
        return;
      }

      try {
        console.log('Confirming email with token_hash:', token_hash);
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });

        console.log('Email confirmation result:', { data, error });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage(getErrorMessage(error));
          return;
        }

        if (!data.user) {
          setStatus('error');
          setMessage('確認に失敗しました。');
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        // Update auth store
        setUser(data.user);
        setProfile(profileData);

        setStatus('success');
        setMessage('メールアドレスの確認が完了しました。');

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('予期しないエラーが発生しました。');
      }
    };

    confirmEmail();
  }, [searchParams, navigate, setUser, setProfile]);

  const getErrorMessage = (error: any): string => {
    if (error.message?.includes('Token has expired')) {
      return '確認リンクの有効期限が切れています。新しい確認メールをリクエストしてください。';
    }
    if (error.message?.includes('Token not found')) {
      return '無効な確認リンクです。';
    }
    return error.message || '確認に失敗しました。';
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            メール確認
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {status === 'loading' && (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">
                メールアドレスを確認中です...
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                3秒後にホームページにリダイレクトします...
              </Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleGoToLogin}
                >
                  ログインページへ
                </Button>
                <Button
                  variant="contained"
                  onClick={handleGoHome}
                >
                  ホームページへ
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};