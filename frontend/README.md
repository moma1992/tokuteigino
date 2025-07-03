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

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Testing

The project follows Test-Driven Development (TDD) principles with comprehensive test coverage:

- Unit tests for business logic and utilities
- Component tests with React Testing Library
- Integration tests for API interactions
- Current coverage: 60.82% (target: 80%+)

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
