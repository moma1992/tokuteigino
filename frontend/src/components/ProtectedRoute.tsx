import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, profile } = useAuthStore();
  const location = useLocation();

  // ローディング中は読み込み画面を表示
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          認証状態を確認中...
        </Typography>
      </Box>
    );
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 特定の役割が必要な場合のチェック
  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" color="error">
          アクセス権限がありません
        </Typography>
        <Typography variant="body1" color="text.secondary">
          このページにアクセスするには{requiredRole === 'teacher' ? '教師' : '学生'}権限が必要です。
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};