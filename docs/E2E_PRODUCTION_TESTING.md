# E2E Production Testing Guide

本番環境のSupabaseに対してE2Eテストを実行するためのガイドです。

## セットアップ

### 1. 環境変数の設定

本番環境のSupabase設定を環境変数として設定します：

```bash
# .env.productionファイルを作成
cp .env.production.example .env.production

# 以下の変数を設定
export VITE_SUPABASE_PROD_URL=https://your-project-id.supabase.co
export VITE_SUPABASE_PROD_ANON_KEY=your-production-anonymous-key
```

### 2. Supabase設定の確認

本番環境のSupabaseプロジェクトで以下を確認してください：

- Anonymous keyが正しく設定されている
- Row Level Security (RLS) が適切に設定されている
- 必要なテーブルとスキーマが存在している

## 使用可能なMakeコマンド

### 環境変数設定の確認
```bash
make test-e2e-prod-setup
```
必要な環境変数の設定方法を表示します。

### 全E2Eテストの実行（本番環境）
```bash
make test-e2e-prod
```
すべてのE2Eテストを本番環境のSupabaseに対して実行します。

### 認証テストのみ実行（本番環境）
```bash
make test-e2e-prod-auth
```
認証関連のE2Eテストのみを本番環境のSupabaseに対して実行します。

## npm scriptsを直接使用する場合

フロントエンドコンテナ内で直接実行：

```bash
# コンテナに接続
make shell-frontend

# 本番環境変数を設定してテスト実行
export VITE_SUPABASE_URL=$VITE_SUPABASE_PROD_URL
export VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_PROD_ANON_KEY

# 全テスト実行
npm run test:e2e:prod

# 認証テストのみ
npm run test:e2e:prod:auth

# デバッグモード
npm run test:e2e:prod:debug

# ヘッドモード（GUI表示、要X11設定）
npm run test:e2e:prod:headed
```

## 安全対策

### 1. 確認プロンプト
本番環境に対するテストは、実行前に確認プロンプトが表示されます。

### 2. 読み取り専用テスト
テストは基本的に読み取り専用で設計されています。データの変更は最小限に抑えられています。

### 3. テストユーザー
本番環境用の専用テストユーザーアカウントを作成することを推奨します。

## テスト結果

テスト結果は以下に保存されます：
- `frontend/test-results/production-results.json` - JSON形式の結果
- `frontend/playwright-report/` - HTMLレポート

## トラブルシューティング

### 接続エラー
```bash
# Supabase URLが正しいか確認
curl -I $VITE_SUPABASE_PROD_URL

# Anonymous keyが有効か確認
curl -H "apikey: $VITE_SUPABASE_PROD_ANON_KEY" $VITE_SUPABASE_PROD_URL/rest/v1/
```

### 認証エラー
- Row Level Security (RLS) の設定を確認
- Anonymous keyの権限を確認
- テストユーザーの存在を確認

### タイムアウトエラー
本番環境では応答時間が異なる場合があります：
- `playwright.prod.config.ts` でタイムアウト値を調整
- ネットワーク接続を確認

## 注意事項

⚠️ **警告**: このテストは本番環境に対して実行されます
- テストデータの作成/削除が行われる可能性があります
- 本番ユーザーに影響を与える可能性があります
- 実行前に必ず内容を確認してください

📋 **推奨事項**:
- テスト専用のSupabaseプロジェクトの使用を検討
- 本番環境では最小限の権限でテスト実行
- 定期的なバックアップの実施