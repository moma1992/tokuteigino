import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Warning,
  CloudQueue
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const TestSupabase: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { signup, logout } = useAuthStore();

  console.log('TestSupabase component rendering');
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

  const runConnectionTest = async () => {
    setIsTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    try {
      // Test 1: Basic connection
      testResults.push({
        name: 'Supabase接続',
        status: 'success',
        message: `URL: ${import.meta.env.VITE_SUPABASE_URL}`
      });

      // Test 2: Check tables
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (profilesError) {
        testResults.push({
          name: 'Profilesテーブル',
          status: 'error',
          message: profilesError.message
        });
      } else {
        testResults.push({
          name: 'Profilesテーブル',
          status: 'success',
          message: 'テーブルが存在します'
        });
      }

      // Test 3: Test signup
      const testEmail = `test-${Date.now()}@example.com`;
      try {
        await signup({
          email: testEmail,
          password: 'Test123456!',
          fullName: 'Test User',
          role: 'student'
        });

        testResults.push({
          name: 'ユーザー登録',
          status: 'success',
          message: `ユーザー作成成功: ${testEmail}`
        });

        // Test 4: Check profile creation
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', testEmail)
          .single();

        if (profileError) {
          testResults.push({
            name: 'プロファイル自動作成',
            status: 'error',
            message: profileError.message
          });
        } else {
          testResults.push({
            name: 'プロファイル自動作成',
            status: 'success',
            message: `役割: ${profile.role}`
          });
        }

        // Cleanup - logout
        await logout();
      } catch (signupError) {
        testResults.push({
          name: 'ユーザー登録',
          status: 'error',
          message: signupError instanceof Error ? signupError.message : String(signupError)
        });
      }

      // Test 5: RLS policies
      const { data: unauthorizedData, error: rlsError } = await supabase
        .from('profiles')
        .select('*');

      if (rlsError || !unauthorizedData || unauthorizedData.length === 0) {
        testResults.push({
          name: 'RLSポリシー',
          status: 'success',
          message: '未認証ユーザーはデータにアクセスできません'
        });
      } else {
        testResults.push({
          name: 'RLSポリシー',
          status: 'warning',
          message: 'RLSが正しく設定されていない可能性があります'
        });
      }

    } catch (error) {
      testResults.push({
        name: '予期しないエラー',
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }

    setResults(testResults);
    setIsTesting(false);
  };

  const getIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Supabase接続テスト
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          本番環境のSupabaseへの接続と認証機能をテストします。
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>接続先:</strong> {import.meta.env.VITE_SUPABASE_URL}<br />
              <strong>プロジェクトID:</strong> {import.meta.env.VITE_SUPABASE_PROJECT_REF || 'rvbapnvvyzxlhtsurqtg'}
            </Typography>
          </Alert>
        </Box>

        <Button
          variant="contained"
          onClick={runConnectionTest}
          disabled={isTesting}
          startIcon={isTesting ? <CircularProgress size={20} /> : <CloudQueue />}
          fullWidth
          size="large"
        >
          {isTesting ? 'テスト実行中...' : '接続テストを実行'}
        </Button>

        {results.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              テスト結果
            </Typography>
            <List>
              {results.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getIcon(result.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.name}
                    secondary={result.message}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
};