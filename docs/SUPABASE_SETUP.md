# Supabase本番環境セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://app.supabase.com) にアクセス
2. 新しいプロジェクトを作成またはサインイン
3. プロジェクト名、データベースパスワード、リージョンを設定

## 2. 認証情報の取得

プロジェクトダッシュボード → Settings → API から以下を取得：

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (サーバーサイド用)

## 3. 環境変数の設定

### フロントエンド用 (`frontend/.env.production`)

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### バックエンド用 (`.env`)

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 4. データベースマイグレーション

### 方法1: Supabase CLIを使用

```bash
# Supabase CLIのインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref

# マイグレーションを実行
supabase db push
```

### 方法2: SQLエディタを使用

1. Supabaseダッシュボード → SQL Editor
2. `supabase/migrations/20250104_init_auth_schema.sql` の内容をコピー
3. 実行

## 5. 認証設定

### Email認証の設定

1. Authentication → Providers → Email
2. 以下を確認/設定：
   - Enable Email provider: ON
   - Confirm email: ON/OFF (要件に応じて)
   - Email template: カスタマイズ可能

### Google OAuth設定（オプション）

1. Authentication → Providers → Google
2. Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
3. クライアントID/シークレットを設定
4. リダイレクトURL: `https://your-project-ref.supabase.co/auth/v1/callback`

## 6. Row Level Security (RLS)

マイグレーションファイルにRLSポリシーが含まれていますが、確認：

1. Table Editor → profiles/teacher_students
2. RLS: Enabled になっていることを確認
3. Policies タブでポリシーが適用されていることを確認

## 7. 接続テスト

### ローカル環境でのテスト

```bash
# 本番環境の設定を使用
cd frontend
npm run dev -- --mode production
```

ブラウザで `http://localhost:5173/test-supabase` にアクセス

### テスト項目

1. ✅ Supabase接続
2. ✅ Profilesテーブル
3. ✅ ユーザー登録
4. ✅ プロファイル自動作成
5. ✅ RLSポリシー

## 8. トラブルシューティング

### "relation 'profiles' does not exist" エラー

→ マイグレーションが実行されていません。手順4を確認してください。

### 認証エラー

→ Anon Keyが正しくコピーされているか確認してください。

### CORS エラー

→ Supabaseダッシュボード → Settings → API → CORS で許可するドメインを追加

### RLSエラー

→ Table Editor でRLSが有効になっているか確認してください。

## 9. 本番デプロイ時の注意

1. **環境変数**: 本番サーバーに環境変数を設定
2. **HTTPS**: 本番環境ではHTTPSを使用
3. **ドメイン設定**: Authentication → URL Configuration でサイトURLを設定
4. **メール設定**: SMTP設定をカスタマイズ（オプション）

## 10. モニタリング

- **Database**: ダッシュボードでクエリパフォーマンスを監視
- **Auth**: Authentication → Logsで認証ログを確認
- **Storage**: 使用量を監視（必要に応じて）