# [FEAT] Supabase認証・ユーザー管理システム (Auth + RLS + User Management)

## 🎯 背景・目的
特定技能試験学習支援ウェブアプリにおける堅牢な認証・ユーザー管理システムを構築し、教師・学生の役割ベースアクセス制御、Row Level Security (RLS)、多言語対応ユーザープロファイル管理を実装する。

## 📋 要件

### **機能要件**
- [ ] Supabase Auth認証システム統合
- [ ] 教師・学生ロールベースアクセス制御
- [ ] ユーザープロファイル管理（多言語対応）
- [ ] 教師-学生関係管理機能
- [ ] Row Level Security (RLS) ポリシー実装
- [ ] メール招待システム
- [ ] パスワードリセット・アカウント管理
- [ ] Stripe顧客ID連携準備

### **非機能要件**
- [ ] セキュリティ: RLS + JWT + HTTPS
- [ ] パフォーマンス: 認証状態キャッシュ最適化
- [ ] 可用性: Supabase 99.9% SLA
- [ ] 国際化: 4言語対応（日本語・英語・中国語・ベトナム語）
- [ ] GDPR・個人情報保護法対応

## 🏗️ 技術スタック

### **認証・データベース**
- **認証**: Supabase Auth (JWT + Row Level Security)
- **データベース**: PostgreSQL 15+ (Supabase)
- **リアルタイム**: Supabase Realtime Subscriptions
- **セキュリティ**: RLS + API Key + JWT

### **フロントエンド統合**
- **認証フック**: Custom React Hooks
- **状態管理**: Zustand Auth Store + Supabase Session
- **ルート保護**: React Router Protected Routes
- **UI**: Material-UI + 多言語フォーム

### **バックエンド**
- **API**: Supabase Auto-generated REST API
- **Edge Functions**: Deno (招待・通知処理)
- **型安全**: Supabase Generated TypeScript Types

## 📊 データベース設計

### **テーブル構造**
```sql
-- ユーザープロファイル（メインテーブル）
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('student', 'teacher')) NOT NULL,
    language_preference TEXT DEFAULT 'ja' CHECK (language_preference IN ('ja', 'en', 'zh', 'vi')),
    stripe_customer_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 教師-学生関係管理
CREATE TABLE teacher_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    invitation_code TEXT UNIQUE,
    UNIQUE(teacher_id, student_id)
);

-- 招待コード管理
CREATE TABLE invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invitation_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Row Level Security (RLS) ポリシー**
```sql
-- プロファイル テーブル RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロファイルのみ参照・更新可能
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 教師は関連学生のプロファイルを参照可能
CREATE POLICY "Teachers can view student profiles"
    ON profiles FOR SELECT
    USING (
        role = 'student' 
        AND EXISTS (
            SELECT 1 FROM teacher_students 
            WHERE teacher_students.student_id = profiles.id 
            AND teacher_students.teacher_id = auth.uid()
            AND teacher_students.status = 'active'
        )
    );

-- 教師-学生関係 テーブル RLS
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their students"
    ON teacher_students FOR ALL
    USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their teacher relationships"
    ON teacher_students FOR SELECT
    USING (student_id = auth.uid());
```

## 📁 実装ファイル構造

```
src/
├── lib/
│   ├── supabase.ts              # Supabase クライアント設定
│   ├── auth.ts                  # 認証ヘルパー関数
│   └── types.ts                 # Supabase 生成型定義
├── hooks/
│   ├── useAuth.ts               # 認証状態管理フック
│   ├── useProfile.ts            # プロファイル管理フック
│   └── useTeacherStudents.ts    # 教師-学生関係フック
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # ログインフォーム
│   │   ├── SignupForm.tsx       # 新規登録フォーム
│   │   ├── RoleSelector.tsx     # 役割選択コンポーネント
│   │   ├── ProfileForm.tsx      # プロファイル編集
│   │   └── InviteForm.tsx       # 招待フォーム
│   └── layout/
│       ├── AuthLayout.tsx       # 認証レイアウト
│       └── ProtectedRoute.tsx   # 認証ルート保護
├── pages/
│   ├── auth/
│   │   ├── Login.tsx            # ログインページ
│   │   ├── Signup.tsx           # 新規登録ページ
│   │   ├── ForgotPassword.tsx   # パスワードリセット
│   │   └── ResetPassword.tsx    # パスワード更新
│   └── profile/
│       ├── Profile.tsx          # プロファイル表示
│       ├── EditProfile.tsx      # プロファイル編集
│       └── ManageStudents.tsx   # 学生管理 (教師用)
├── store/
│   ├── authStore.ts             # 認証状態ストア
│   └── profileStore.ts          # プロファイル状態ストア
└── utils/
    ├── validation.ts            # バリデーション関数
    └── constants.ts             # 定数定義
```

## 🎪 完了基準

### **認証機能**
- [ ] メール + パスワード認証動作確認
- [ ] 教師・学生ロール選択・切り替え確認
- [ ] ログイン・ログアウト・自動ログイン確認
- [ ] パスワードリセット・アカウント管理確認
- [ ] トークン有効期限・リフレッシュ確認

### **ユーザー管理**
- [ ] プロファイル作成・更新・削除確認
- [ ] 多言語設定・切り替え確認
- [ ] アバター画像アップロード確認
- [ ] 教師-学生招待システム確認
- [ ] 招待コード生成・有効期限管理確認

### **セキュリティ**
- [ ] RLS ポリシー全件動作確認
- [ ] 不正アクセス防止テスト（学生→教師データ）
- [ ] SQL インジェクション耐性確認
- [ ] JWT トークン検証・期限管理確認
- [ ] HTTPS 通信・セキュリティヘッダー確認

### **パフォーマンス・UI/UX**
- [ ] 認証状態レスポンス時間 < 500ms
- [ ] プロファイル更新レスポンス時間 < 1s
- [ ] 多言語切り替えレスポンス時間 < 200ms
- [ ] モバイル・デスクトップ レスポンシブ確認
- [ ] アクセシビリティ（スクリーンリーダー）確認

## 🧪 テスト戦略

### **Unit Tests (70%)**
- [ ] `useAuth` フック認証状態管理テスト
- [ ] `useProfile` フックプロファイル操作テスト
- [ ] `useTeacherStudents` フック関係管理テスト
- [ ] 認証ヘルパー関数テスト
- [ ] バリデーション関数テスト
- [ ] Zustand ストア状態管理テスト

### **Integration Tests (20%)**
- [ ] Supabase Auth認証フローテスト
- [ ] プロファイル CRUD操作テスト
- [ ] 教師-学生関係管理フローテスト
- [ ] RLS ポリシー統合テスト
- [ ] 多言語切り替え統合テスト
- [ ] React Router 認証ガード テスト

### **E2E Tests (10%)**
- [ ] ユーザー登録・ログイン・ログアウト フロー
- [ ] 教師による学生招待フロー
- [ ] 学生による招待受諾フロー
- [ ] プロファイル編集・言語切り替えフロー
- [ ] パスワードリセットフロー
- [ ] セキュリティ侵害テスト（不正アクセス）

## 📦 主要依存関係

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.6",
    "@supabase/auth-helpers-react": "^0.5.0",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.24.1",
    "react-i18next": "^15.1.4",
    "i18next": "^24.0.5",
    "@mui/x-date-pickers": "^7.24.0"
  },
  "devDependencies": {
    "@testing-library/react-hooks": "^8.0.1",
    "msw": "^2.6.6",
    "@supabase/auth-helpers-testing": "^0.1.0"
  }
}
```

## 🔧 設定・環境変数

```bash
# Supabase設定
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# セキュリティ設定
VITE_JWT_SECRET=your-jwt-secret
VITE_INVITATION_EXPIRY_DAYS=7

# 多言語設定
VITE_DEFAULT_LANGUAGE=ja
VITE_SUPPORTED_LANGUAGES=ja,en,zh,vi
```

## 📋 実装フェーズ

### **Phase 1: 基本認証 (1週間)**
- [ ] Supabase クライアント設定
- [ ] 基本認証フロー（ログイン・新規登録）
- [ ] React フック・状態管理
- [ ] プロテクトルート実装

### **Phase 2: プロファイル管理 (1週間)**
- [ ] プロファイル CRUD機能
- [ ] 役割選択・管理
- [ ] 多言語設定機能
- [ ] アバター画像管理

### **Phase 3: 教師-学生関係 (1週間)**
- [ ] 招待システム実装
- [ ] 教師による学生管理
- [ ] 学生による教師関係確認
- [ ] 招待コード・有効期限管理

### **Phase 4: セキュリティ・テスト (1週間)**
- [ ] RLS ポリシー実装・テスト
- [ ] セキュリティ監査・脆弱性テスト
- [ ] パフォーマンステスト・最適化
- [ ] 多言語対応・アクセシビリティ

## 🔗 関連Issue

- **Epic**: #1 - Core Learning Platform Development - Phase 1
- **依存**: #5 - フロントエンド基盤構築 (React + Vite + TypeScript + MUI)
- **ブロック**: 
  - #TBD - PDF処理・テキスト抽出機能
  - #TBD - OpenAI問題生成エンジン
  - #TBD - Stripe決済・サブスクリプション統合

## 💡 実装メモ

- **セキュリティファースト**: RLS + JWT + 最小権限原則
- **多言語対応**: react-i18next + 文化的配慮
- **パフォーマンス**: 認証状態キャッシュ + リアルタイム同期
- **アクセシビリティ**: ARIA + スクリーンリーダー対応
- **型安全性**: Supabase 自動生成型 + Zod バリデーション
- **テスト駆動**: TDD + Mock Service Worker (MSW)
- **Docker**: コンテナ内でのSupabase Local Development

---
**Claude Code Action使用想定**: ✅ この機能はClaude Code Actionを使用してTDDで実装予定