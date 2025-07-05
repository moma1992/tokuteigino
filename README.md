# TOKUTEI Learning（トクテイ ラーニング）

特定技能試験学習支援ウェブアプリケーション - 軽量Docker開発環境

## 🚀 クイックスタート（軽量版）

### 必要な環境
- Docker Desktop (2GB メモリ制限推奨)
- Make

### 1. 初期セットアップ
```bash
# リポジトリクローン
git clone <repository-url>
cd tokuteigino

# 初期セットアップ
make setup
```

### 2. 開発環境起動
```bash
# 軽量開発環境を起動
make dev

# または
make up
```

### 3. アクセス
- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs
- **Supabase ダッシュボード**: https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg

## 📊 リソース使用量

### メモリ制限（最適化済み）
- **フロントエンド**: 1GB制限 (256MB予約)
- **バックエンド**: 1GB制限 (256MB予約)
- **合計**: 2GB制限

### 削除されたコンテナ（軽量化）
- ~~PostgreSQL~~ → 本番Supabase使用
- ~~Redis~~ → 本番Supabase使用
- ~~pgAdmin~~ → Supabaseダッシュボード使用
- ~~ローカルSupabase~~ → 本番Supabase使用

## 🛠️ 開発コマンド

### 環境管理
```bash
make up          # サービス開始
make down        # サービス停止
make restart     # サービス再起動
make status      # ステータス確認
make health      # ヘルスチェック
```

### ログ確認
```bash
make logs               # 全ログ
make logs-backend       # バックエンドログ
make logs-frontend      # フロントエンドログ
```

### テスト実行
```bash
make test                    # 全テスト
make test-backend           # バックエンドテスト
make test-frontend          # フロントエンドテスト
make test-e2e-prod-auth     # 本番E2Eテスト
```

### コード品質
```bash
make lint        # リント
make format      # フォーマット
make typecheck   # 型チェック
```

## 🗄️ データベース操作

### 本番Supabase使用
- **ダッシュボード**: https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg
- **SQL エディタ**: https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/editor
- **テーブル管理**: https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/database/tables

### 型生成
```bash
# 本番データベースからTypeScript型を生成
npx supabase gen types typescript --project-id=rvbapnvvyzxlhtsurqtg > types/supabase.ts
```

## 🏗️ アーキテクチャ

### フロントエンド
- **React 18+** + TypeScript
- **Vite** 開発サーバー
- **Material-UI (MUI)** UI コンポーネント
- **Zustand** 状態管理
- **React Query** サーバー状態管理

### バックエンド
- **FastAPI** + Python
- **Poetry** パッケージ管理
- **本番Supabase** 接続

### 外部サービス
- **Supabase** (PostgreSQL, Auth, Storage, Vector)
- **OpenAI** GPT-4o (質問生成)
- **Stripe** (決済)

## 🧪 テスト戦略

### E2Eテスト
```bash
# 本番環境での安全なUIテスト
make test-e2e-prod-auth

# モック認証を使用したテスト
# ファイル: frontend/e2e/auth/login-logout.spec.ts
```

### モック認証
- テストモード検出: `?test=true` パラメータ
- モックユーザー: 確認済み/未確認ユーザー
- 安全なテスト: 実際のユーザーアカウント作成なし

## 🔧 トラブルシューティング

### メモリ使用量確認
```bash
# コンテナリソース使用量
docker stats

# 詳細なメモリ使用量
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### 接続テスト
```bash
# バックエンドヘルスチェック
curl http://localhost:8000/health

# フロントエンド確認
curl http://localhost:5173/

# Supabase接続テスト
curl -H "apikey: YOUR_ANON_KEY" https://rvbapnvvyzxlhtsurqtg.supabase.co/rest/v1/
```

### Docker環境リセット
```bash
# キャッシュクリア
make clean

# 完全リセット
make clean-volumes
```

## 📝 開発ガイドライン

### TDD開発
1. **Red**: テスト失敗を書く
2. **Green**: 最小限のコードでテスト合格
3. **Refactor**: コード品質向上

### Docker-First開発
- すべての開発作業はDockerコンテナ内で実行
- ホストマシンでの`npm install`等は禁止
- `make shell-frontend`、`make shell-backend`でコンテナ内作業

### コード規約
- TypeScript使用必須
- React 18 Concurrent Features活用
- MCP (Model Context Protocol) 利用推奨

## 🌐 本番環境

### デプロイ
- **Vercel**: フロントエンドホスティング
- **Vercel Functions**: バックエンドAPI
- **Supabase**: データベース・認証

### 環境変数
```bash
VITE_SUPABASE_PROD_URL=https://rvbapnvvyzxlhtsurqtg.supabase.co
VITE_SUPABASE_PROD_ANON_KEY=your-production-key
```

## 📞 サポート

### ヘルプ
```bash
make help  # 利用可能コマンド一覧
```

### ドキュメント
- **技術詳細**: `CLAUDE.md`
- **API仕様**: http://localhost:8000/docs
- **Supabase**: https://supabase.com/docs

---

**軽量Docker開発環境で効率的な開発を！** 🚀