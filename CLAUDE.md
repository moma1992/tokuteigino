# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TOKUTEI Learning（トクテイ ラーニング）** - 特定技能試験学習支援ウェブアプリ

A web learning application for foreign workers preparing for Japan's Specified Skills (特定技能) exam. The app enables teachers to upload PDFs and automatically generate practice questions with furigana support, while students can practice and track their progress.

## Architecture

### Frontend
- **React 18+** with TypeScript
- **Vite** for build tooling and development server
- **React Router v6** for routing
- **Material-UI (MUI)** for UI components
- **Zustand** for state management
- **React Query** for server state management

### Backend
- **FastAPI** with Vercel Functions
- **Supabase** (PostgreSQL 15+) for database
- **Supabase Auth** with Row Level Security
- **Supabase Realtime + WebSockets**
- **Supabase Edge Functions** (Deno)

### AI & Vector Database
- **OpenAI GPT-4o/GPT-4o-mini** for question generation
- **Supabase Vector (pgvector)** + OpenAI Embeddings for RAG
- **PyPDF2** for PDF text extraction
- **Web Speech API** for text-to-speech functionality

### Payment
- **Stripe** subscription integration with React

## Database Schema

Key tables:
- `profiles` - User management (students/teachers)
- `teacher_students` - Teacher-student relationships
- `learning_materials` - PDF content storage
- `content_embeddings` - Vectorized content for RAG
- `questions` - Auto-generated questions with furigana
- `learning_records` - Student practice history
- `incorrect_questions` - Wrong answers for review system

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Run Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > types/supabase.ts
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy

# Deploy Supabase Edge Functions
npx supabase functions deploy
```

## Key Features

### Student Functions
- Practice questions with furigana support
- Progress tracking and statistics
- Smart review system based on forgetting curve
- Real-time feedback and explanations

### Teacher Functions
- PDF upload and automatic question generation
- Student progress monitoring
- Class analytics and reporting
- Subscription management via Stripe

## Development Guidelines

### File Structure
- `/src/pages` - React Router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and API clients
- `/src/types` - TypeScript type definitions
- `/supabase` - Database functions and migrations

### Coding Standards
- Use TypeScript for all code
- Follow React best practices
- Implement proper error handling
- Use React 18 Concurrent Features
- Optimize for web performance with Vite

### Localization
- Primary language: Japanese (with furigana)
- UI languages: Japanese, English, Chinese, Vietnamese
- Use react-i18next for internationalization

## MVP Implementation Phases

### Phase 1 (2 months)
- React + Vite setup with TypeScript
- Supabase authentication and database
- PDF upload and vectorization
- GPT-4o question generation
- Furigana support with Web Speech API
- Stripe payment integration

### Phase 2 (1 month)
- RAG-based similar question generation
- Offline learning with localStorage
- Web push notifications
- Learning analytics dashboard
- Real-time progress sharing

## Subscription Plans

- **Free**: 10 questions/day for students, 3 students max for teachers
- **Basic (¥1,980/month)**: Unlimited questions, 15 students max
- **Pro (¥4,980/month)**: Unlimited features, detailed analytics

## Development Style & TDD Strategy

### Test-Driven Development (TDD) Approach

Follow TDD methodology: **Red → Green → Refactor**

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass tests
3. **Refactor**: Improve code quality while maintaining passing tests

### Testing Pyramid for Mobile App

#### 1. Unit Tests (Base Layer - 70%)
- **Focus**: Individual functions, utilities, business logic
- **Tools**: Jest with TypeScript support
- **Speed**: Fast (< 1ms per test)
- **Coverage**: Pure functions, state management, data transformations

```bash
# Run unit tests
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage
```

#### 2. Integration Tests (Middle Layer - 20%)
- **Focus**: Component interactions, API integrations, database operations
- **Tools**: Jest + React Native Testing Library
- **Speed**: Medium (100ms - 1s per test)
- **Coverage**: Component behavior, API endpoints, data flow

```bash
# Run integration tests
npm run test:integration
npm run test:integration:watch
```

#### 3. End-to-End Tests (Top Layer - 10%)
- **Focus**: Complete user workflows, critical business scenarios
- **Tools**: Detox or Maestro
- **Speed**: Slow (10s - 60s per test)
- **Coverage**: Authentication flow, core features, payment processes

```bash
# Run E2E tests
npm run test:e2e:ios
npm run test:e2e:android
```

### Component Testing Strategy

#### React Component Testing
- Use React Testing Library for component testing
- Focus on user interactions rather than implementation details
- Test component props, state changes, and user events
- Mock React Router navigation and external dependencies

#### AI/LLM Feature Testing
- **Mock OpenAI API calls** to avoid costs and delays in tests
- Use **MockGPT** or custom mocks for GPT-4o responses
- Test question generation logic with predefined responses
- Validate furigana generation and text processing

```typescript
// Example: Mock OpenAI API
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'mocked response' } }]
        })
      }
    }
  }))
}));
```

### Backend Testing Strategy

#### FastAPI + Supabase Testing
- Use **pytest** for Python backend testing
- Create isolated test database for each test suite
- Mock external APIs and services
- Test CRUD operations, authentication, and business logic

#### Database Testing with Supabase
- Use Supabase CLI for local testing environment
- Create test fixtures for database seeding
- Test Row Level Security (RLS) policies
- Validate real-time subscriptions and edge functions

```bash
# Setup local Supabase for testing
npx supabase start
npx supabase db reset
npx supabase gen types typescript --local > types/supabase.ts
```

### Test Organization & Best Practices

#### File Structure
```
tests/
├── unit/           # Pure logic tests
├── integration/    # Component & API tests
├── e2e/           # End-to-end scenarios
├── fixtures/      # Test data & mocks
└── helpers/       # Test utilities
```

#### Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Describe blocks: Feature or component name
- Test cases: Behavior description with "should" or "given...when...then"

#### Mocking Strategy
- **External APIs**: Mock OpenAI, Stripe, third-party services
- **Navigation**: Mock React Router navigation
- **Storage**: Mock localStorage for offline functionality
- **Web APIs**: Mock Web Speech API, File API, notifications

### CI/CD Integration

#### Automated Testing Pipeline
```bash
# Pre-commit hooks
npm run lint
npm run typecheck
npm run test:unit

# CI Pipeline
npm run test:all
npm run test:coverage
npm run build
```

#### Quality Gates
- **Unit test coverage**: Minimum 80%
- **Integration test coverage**: Critical paths covered
- **E2E test coverage**: Core user flows validated
- **Performance**: Bundle size and render performance monitored

### TDD Benefits for This Project

1. **Confidence in AI Integration**: Ensure question generation works correctly
2. **Database Reliability**: Validate complex queries and RLS policies
3. **Web Performance**: Catch performance regressions early
4. **Feature Quality**: Maintain high standards for learning features
5. **Refactoring Safety**: Enable confident code improvements

### Development Workflow

1. **Feature Development**:
   - Write failing test for new feature
   - Implement minimal code to pass
   - Refactor and optimize
   - Update documentation

2. **Bug Fixes**:
   - Write test that reproduces the bug
   - Fix the bug to make test pass
   - Ensure no regression in existing tests

3. **Code Review**:
   - All code changes must include tests
   - Test coverage should not decrease
   - Tests must pass in CI before merge

## Docker Development Environment

### Quick Start

```bash
# Initial setup (first time only)
make setup

# Start development environment
make dev
# or
make up

# Stop environment
make down
```

### Docker Services

#### Core Services
- **Frontend**: React + Vite (Port: 5173)
- **Backend**: FastAPI + Python (Port: 8000)
- **Database**: PostgreSQL 15 (Port: 5432)
- **Cache**: Redis 7 (Port: 6379)
- **Proxy**: Nginx (Port: 80, 443)

#### Development Tools
- **pgAdmin**: Database management (Port: 5050)
- **Supabase**: Local Supabase instance (Port: 54322)

#### Test Environment
- **postgres-test**: Test database (Port: 5433)
- **redis-test**: Test cache (Port: 6380)
- **backend-test**: API testing with pytest + coverage
- **frontend-test**: Component testing with Jest
- **e2e-test**: End-to-end testing with Playwright

### Development Commands

#### Environment Management
```bash
# Build all containers
make build

# Start all services
make up

# Stop all services
make down

# Restart services
make restart

# View logs
make logs
make logs-backend
make logs-frontend
make logs-db
```

#### Development Tools
```bash
# Access container shells
make shell-backend
make shell-frontend
make shell-db

# Check service health
make health
make status
```

#### Testing in Docker
```bash
# Run all tests
make test

# Run specific test suites
make test-backend
make test-frontend
make test-e2e

# Run tests in watch mode
make test-watch
```

#### Code Quality
```bash
# Run linting
make lint

# Format code
make format

# Type checking
make typecheck

# Full CI pipeline
make ci
```

#### Database Operations
```bash
# Reset database with seed data
make db-reset

# Run migrations
make db-migrate

# Create backup
make db-backup

# Access database shell
make shell-db
```

#### Supabase Operations
```bash
# Start local Supabase
make supabase-start

# Stop local Supabase
make supabase-stop

# Reset Supabase database
make supabase-reset
```

### Container Architecture

#### Frontend Container (React + Vite)
- **Base Image**: node:18-alpine
- **Ports**: 5173
- **Volumes**: Hot reload support
- **Features**: Vite dev server, TypeScript support, health checks

#### Backend Container (FastAPI + Python)
- **Base Image**: python:3.11-slim
- **Package Manager**: Poetry
- **Ports**: 8000
- **Features**: Auto-reload, health checks, non-root user

#### Testing Containers
- **Isolated test environments** for each service
- **Separate databases** for testing
- **Coverage reporting** with HTML output
- **E2E testing** with Playwright

### Environment Configuration

#### Required Environment Variables
```bash
# Copy example and edit
cp .env.example .env

# Key variables to set:
OPENAI_API_KEY=sk-your-key-here
SUPABASE_ANON_KEY=your-supabase-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
```

#### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (admin@example.com / admin)
- **Supabase**: http://localhost:54322
- **Nginx Proxy**: http://localhost:80

### Testing Strategy in Docker

#### Unit Tests
- Run in isolated containers
- Fast feedback loop
- Mocked external dependencies
- Coverage reporting to `/app/htmlcov`

#### Integration Tests
- Real database connections
- API endpoint testing
- Component integration
- Service communication

#### E2E Tests
- Full web application workflows
- Browser automation with Playwright
- Cross-service testing
- User journey validation

### Performance Optimization

#### Container Optimization
- **Multi-stage builds** for production
- **Layer caching** for faster builds
- **Volume mounts** for development
- **Health checks** for reliability

#### Development Workflow
- **Hot reloading** for both frontend and backend
- **Incremental builds** with Docker layer caching
- **Parallel testing** across multiple containers
- **Resource limits** to prevent system overload

### Troubleshooting

#### Common Issues
```bash
# Clear Docker cache
make clean

# Reset entire environment
./scripts/dev.sh reset

# View service logs
docker-compose logs [service-name]

# Check container resource usage
docker stats
```

#### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Access container internals
docker-compose exec [service] bash

# Network debugging
docker network ls
docker network inspect tokuteigino_tokuteigino-network
```

### Production Deployment

#### Docker Images
- **Optimized production builds** with multi-stage Dockerfiles
- **Security scanning** with Snyk/Trivy
- **Image size optimization** using Alpine Linux
- **Non-root containers** for security

#### Container Orchestration
- **Kubernetes** manifests for production
- **Helm charts** for deployment management
- **Auto-scaling** based on load
- **Rolling updates** with zero downtime