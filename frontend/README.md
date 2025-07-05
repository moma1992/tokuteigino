# TOKUTEI Learning Frontend

## Overview

This is the frontend application for TOKUTEI Learning (トクテイ ラーニング), a web learning platform designed to help foreign workers prepare for Japan's Specified Skills (特定技能) exam.

## Technology Stack

- **React 19.1.0** with TypeScript 5.8.3
- **Vite 7.0.0** for lightning-fast development and optimized builds
- **Material-UI 7.2.0** for modern, accessible UI components
- **Zustand** for efficient state management
- **React Query** for server state synchronization
- **React Router v6** for client-side routing

## Key Features

- 📚 Interactive question practice with furigana support
- 📊 Real-time progress tracking and analytics
- 🎯 Smart review system based on forgetting curve
- 🌏 Multi-language support (Japanese, English, Chinese, Vietnamese)
- 📱 Responsive design for all devices

## Development (Docker-First)

**重要**: すべての開発作業はDockerコンテナ内で実行してください。

```bash
# Docker開発環境を起動
make up

# フロントエンドコンテナにアクセス
make shell-frontend

# コンテナ内で依存関係インストール
npm install

# 開発サーバー（コンテナで自動起動）
# http://localhost:5173

# テスト実行（コンテナ内）
npm run test:coverage

# 本番ビルド
npm run build
```

### Docker外での直接実行は禁止

環境の一貫性を保つため、以下は禁止されています：
- ホストマシンでの `npm install`
- ホストマシンでの `npm run dev`
- ホストマシンでの直接テスト実行

### 軽量Docker環境

- **メモリ制限**: 1GB (256MB予約)
- **CPU制限**: 1.0コア (0.25コア予約)
- **本番Supabase接続**: ローカルデータベース不要

## Testing (Docker-Based)

The project follows Test-Driven Development (TDD) principles with comprehensive test coverage:

### テスト種別
- **Unit tests**: ビジネスロジックとユーティリティ
- **Component tests**: React Testing Libraryでコンポーネントテスト
- **Integration tests**: API連携テスト
- **E2E tests**: Playwrightで本番環境テスト

### テスト実行（Docker内）
```bash
# 軽量Docker環境でのテスト
make test-frontend

# E2Eテスト（本番Supabase接続）
make test-e2e-prod-auth

# カバレッジ付きテスト
npm run test:coverage  # コンテナ内で実行
```

### モック認証テスト
- テストモード: `?test=true` パラメータ
- モックユーザー: 確認済み/未確認状態
- 安全性: 本番データベース変更なし

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
