import React from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  School,
  Quiz,
  TrendingUp,
  EmojiEvents
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Box>
      {/* ヒーローセクション */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <School sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          TOKUTEI Learning
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          特定技能試験学習支援アプリ
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          日本の特定技能試験に合格するための包括的な学習プラットフォーム。
          AIによる個別最適化された問題と効率的な学習体験を提供します。
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/study"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            }
          }}
        >
          学習を開始
        </Button>
      </Paper>

      {/* 学習進捗 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          学習進捗
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                総合進捗
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={65} 
                sx={{ height: 8, borderRadius: 4, mt: 1 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                65% 完了
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="日本語: Level 3" color="primary" size="small" />
              <Chip label="介護: Level 2" color="secondary" size="small" />
              <Chip label="建設: Level 1" color="default" size="small" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 機能カード */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                学習コース
              </Typography>
              <Typography variant="body2" color="text.secondary">
                分野別の体系的な学習コンテンツで基礎から応用まで学習
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" component={Link} to="/study">
                開始
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Quiz sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                練習問題
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI生成による個別最適化された問題で実力向上
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" component={Link} to="/practice">
                挑戦
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                進捗管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                詳細な学習分析と弱点克服のためのレコメンド
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" component={Link} to="/profile">
                確認
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                試験対策
              </Typography>
              <Typography variant="body2" color="text.secondary">
                本番形式の模擬試験で試験に向けた最終確認
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small">
                準備中
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;