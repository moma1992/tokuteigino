# Supabase認証・ユーザー管理システム

## 📋 Feature概要
**Epic Issue**: #1 - [EPIC] Core Learning Platform Development - Phase 1

特定技能試験学習支援ウェブアプリにおけるSupabase認証システムとユーザー管理機能を実装。教師・学生の役割ベースアクセス制御（RBAC）とRow Level Security（RLS）を活用したセキュアなユーザー管理システムを構築する。

## 🎯 目的・背景
- **教師・学生の役割分離**: 異なる権限・機能へのアクセス制御
- **セキュアな認証**: Supabase Auth + RLS による堅牢なセキュリティ
- **マルチテナント対応**: 教師-学生関係の効率的な管理
- **サブスクリプション連携**: Stripe決済との統合基盤

## 📋 機能要件

### 🔐 認証機能
- [ ] **メール認証**: メール/パスワードによるサインアップ・サインイン
- [ ] **ソーシャル認証**: Google OAuth（任意）
- [ ] **パスワードリセット**: セキュアなパスワード回復機能
- [ ] **メール確認**: 新規登録時のメール確認プロセス
- [ ] **セッション管理**: セキュアなセッション管理とトークン更新

### 👤 ユーザー管理
- [ ] **プロフィール作成**: 初回ログイン時のプロフィール設定
- [ ] **役割選択**: 教師/学生の役割選択（初回のみ）
- [ ] **プロフィール編集**: 基本情報の更新機能
- [ ] **アカウント削除**: GDPR準拠のアカウント削除機能
- [ ] **多言語対応**: 日本語、英語、中国語、ベトナム語のUI

### 🏫 役割ベースアクセス制御（RBAC）
- [ ] **教師機能**:
  - 学生の招待・管理
  - 学習教材のアップロード
  - 学習進捗の監視
  - サブスクリプションの管理
- [ ] **学生機能**:
  - 教師への参加申請
  - 学習記録の閲覧
  - 練習問題の実行
  - 個人プロフィールの管理

### 👥 教師-学生関係管理
- [ ] **招待システム**: 教師による学生招待機能
- [ ] **承認システム**: 学生の参加申請と教師の承認
- [ ] **関係管理**: 教師-学生関係の追加・削除
- [ ] **クラス管理**: 複数クラス対応（Pro版）

## 🏗️ 技術仕様

### Frontend技術スタック
- **React 18+** with TypeScript
- **Supabase Auth** for authentication
- **Zustand** for authentication state management
- **React Query** for server state management
- **MUI Components** for UI (Auth forms, Profile pages)
- **React Hook Form** for form validation
- **Zod** for schema validation
- **React Router v6** for protected routes

### Backend技術スタック
- **Supabase Auth** with email/password
- **PostgreSQL 15** with Row Level Security
- **Supabase Realtime** for real-time updates
- **Supabase Edge Functions** for custom business logic

### セキュリティ要件
- **Row Level Security (RLS)**: 全テーブルにRLS適用
- **JWT Token**: Supabase JWTトークンによる認証
- **Role-based Access**: 教師・学生役割の厳密な権限管理
- **Data Encryption**: 個人情報の適切な暗号化

## 🗄️ データベース設計

### Supabase Schema
```sql
-- profiles テーブル（RLS適用）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('teacher', 'student')),
  language_preference TEXT DEFAULT 'ja',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- teacher_students テーブル（教師-学生関係）
CREATE TABLE teacher_students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(teacher_id, student_id)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;
```

### TypeScript型定義
```typescript
// Supabase Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_role: 'teacher' | 'student';
  language_preference: 'ja' | 'en' | 'zh' | 'vi';
  created_at: string;
  updated_at: string;
}

export interface TeacherStudent {
  id: string;
  teacher_id: string;
  student_id: string;
  status: 'pending' | 'approved' | 'rejected';
  invited_at: string;
  approved_at: string | null;
}
```

## 🧪 テスト戦略

### Unit Tests (70% - 35 tests)
- **Authentication Hooks**: useAuth, useUser, useSignIn, useSignOut
- **Form Validation**: Zod schemas, form submission logic
- **State Management**: Zustand auth store
- **Utility Functions**: Role checking, permission validation
- **Type Guards**: User role type checking

### Integration Tests (20% - 10 tests)
- **Auth Flow**: Sign up → Email verification → Profile creation
- **Role Assignment**: Teacher/Student role selection and permission
- **Teacher-Student**: Invitation and approval workflow
- **Protected Routes**: Route access based on authentication status
- **Supabase Integration**: Database operations with RLS

### E2E Tests (10% - 5 tests)
- **User Registration**: Complete sign-up workflow
- **Login/Logout**: Authentication state management
- **Profile Management**: User profile creation and updates
- **Role-based Access**: Teacher vs Student feature access
- **Teacher-Student Relationship**: Invitation and approval process

### Testing Setup
```bash
# Docker testing environment
make test-frontend
make test-backend
make test-e2e

# Supabase testing
make supabase-reset
make test-db
```

## 🚀 実装フェーズ

### Phase 1: 基本認証システム (Week 1-2)
- [ ] Supabase Auth セットアップ
- [ ] 基本的なサインアップ/サインイン機能
- [ ] プロフィールテーブルの作成
- [ ] 認証状態管理（Zustand）
- [ ] 保護されたルートの実装

### Phase 2: ユーザー管理機能 (Week 3-4)
- [ ] プロフィール作成・編集画面
- [ ] 役割選択機能
- [ ] パスワードリセット機能
- [ ] メール確認機能
- [ ] 多言語対応

### Phase 3: 役割ベースアクセス制御 (Week 5-6)
- [ ] RLS ポリシーの実装
- [ ] 教師・学生専用機能の分離
- [ ] 権限チェック関数の実装
- [ ] 役割別ナビゲーション

### Phase 4: 教師-学生関係管理 (Week 7-8)
- [ ] 招待システムの実装
- [ ] 承認ワークフローの実装
- [ ] リアルタイム通知
- [ ] 関係管理ダッシュボード

### Phase 5: テスト・最適化 (Week 9-10)
- [ ] 包括的なテスト実装
- [ ] セキュリティ監査
- [ ] パフォーマンス最適化
- [ ] ドキュメント整備

## 💯 完了基準

### 機能完了条件
- [ ] 全認証フローが正常に動作
- [ ] 教師・学生の役割が適切に分離
- [ ] RLS ポリシーが全テーブルで有効
- [ ] 教師-学生関係の管理が完全に機能
- [ ] 多言語対応が完了

### 品質条件
- [ ] テストカバレッジ 80% 以上
- [ ] TypeScript strict mode エラー 0
- [ ] ESLint エラー 0
- [ ] アクセシビリティ監査 合格
- [ ] セキュリティ監査 合格

### パフォーマンス条件
- [ ] 認証フロー完了時間 < 3秒
- [ ] ページ読み込み時間 < 2秒
- [ ] API応答時間 < 500ms
- [ ] モバイル対応完了

## 🔧 開発環境

### Docker Development
```bash
# 開発環境の起動
make dev

# Supabase ローカル環境
make supabase-start

# データベースのリセット
make supabase-reset

# テスト実行
make test
```

### 環境変数
```bash
# Supabase設定
VITE_SUPABASE_URL=http://localhost:54322
VITE_SUPABASE_ANON_KEY=your-anon-key

# 開発環境URL
VITE_SITE_URL=http://localhost:5173
```

## 🚨 リスク・制約事項

### 技術的リスク
- **RLS複雑性**: 複雑なRLSポリシーのデバッグ難易度
- **リアルタイム性能**: 大量ユーザーでのリアルタイム更新
- **セキュリティ**: 認証バイパスの脆弱性

### 対策案
- **段階的実装**: 機能を段階的に追加してテスト
- **包括的テスト**: セキュリティテストの強化
- **監視体制**: 認証エラーの監視・アラート

## 🔗 関連Issue・依存関係

### 前提条件
- [x] #5 - フロントエンド基盤構築（React + Vite + TypeScript）

### 関連Issue（後続）
- [ ] #TBD - PDF処理・テキスト抽出機能
- [ ] #TBD - 学習記録・進捗管理システム
- [ ] #TBD - Stripe決済・サブスクリプション統合

## 📚 参考資料

### 公式ドキュメント
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Integration Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

### 実装例
- [Supabase Auth with React](https://github.com/supabase/supabase/tree/master/examples/auth/react-auth)
- [Multi-tenant RLS Examples](https://supabase.com/docs/guides/auth/row-level-security#multi-tenant-applications)

---

**実装担当**: Claude Code Action  
**予定期間**: 2-3週間  
**優先度**: High - Epic Issue #1 の基盤機能