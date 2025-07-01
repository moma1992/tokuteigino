# TOKUTEI Learning（トクテイ ラーニング）

特定技能試験学習支援アプリ - A mobile learning app for foreign workers preparing for Japan's Specified Skills exam.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/your-username/tokuteigino.git
cd tokuteigino

# Initial setup (creates .env file and builds containers)
make setup

# Start development environment
make dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database Admin**: http://localhost:5050 (admin@example.com / admin)
- **Supabase Local**: http://localhost:54322

## 📋 Available Commands

### Development
```bash
make dev         # Start all services
make up          # Start services in background
make down        # Stop all services
make restart     # Restart all services
make logs        # View all logs
make status      # Show service status
```

### Testing
```bash
make test        # Run all tests
make test-backend    # Backend tests only
make test-frontend   # Frontend tests only
make test-e2e        # End-to-end tests
make ci          # Full CI pipeline
```

### Code Quality
```bash
make lint        # Run linting
make format      # Format code
make typecheck   # Type checking
```

### Database
```bash
make db-reset    # Reset database with seed data
make db-migrate  # Run migrations
make db-backup   # Create backup
make shell-db    # Access database shell
```

### Maintenance
```bash
make clean       # Clean Docker resources
make health      # Health check all services
make help        # Show all commands
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL 15 + Supabase
- **Cache**: Redis 7
- **Proxy**: Nginx
- **Testing**: Jest, Pytest, Playwright

### Docker Services

#### Development Environment
| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | React + Vite development server |
| Backend | 8000 | FastAPI application |
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache and sessions |
| Nginx | 80, 443 | Reverse proxy |
| pgAdmin | 5050 | Database management |
| Supabase | 54322 | Local Supabase instance |

#### Test Environment
| Service | Port | Description |
|---------|------|-------------|
| postgres-test | 5433 | Isolated test database |
| redis-test | 6380 | Test cache |
| backend-test | - | API testing with coverage |
| frontend-test | - | Component testing |
| e2e-test | - | End-to-end testing |

## 🧪 Testing Strategy

### Test Pyramid
- **Unit Tests (70%)**: Fast, isolated function testing
- **Integration Tests (20%)**: Component and API testing
- **E2E Tests (10%)**: Complete user workflows

### Running Tests
```bash
# All tests with coverage
make test

# Backend tests with pytest
make test-backend

# Frontend tests with Jest
make test-frontend

# E2E tests with Playwright
make test-e2e

# Watch mode during development
make test-watch
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Required for development
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_ANON_KEY=your-supabase-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key

# Optional for development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tokuteigino
REDIS_URL=redis://localhost:6379
```

### File Structure
```
.
├── frontend/           # React + Vite application
├── backend/           # FastAPI application
├── docker/            # Docker configurations
├── supabase/          # Database migrations and config
├── scripts/           # Development scripts
├── .github/           # CI/CD workflows
├── docker-compose.yml # Main development environment
└── Makefile          # Development commands
```

## 🚀 Features

### For Students
- Practice questions with furigana support
- Progress tracking and analytics
- Smart review system
- Real-time feedback

### For Teachers
- PDF upload with automatic question generation
- Student progress monitoring
- Class analytics
- Subscription management

## 🛠️ Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/your-feature`
2. Write tests first (TDD approach)
3. Implement feature
4. Run tests: `make test`
5. Check code quality: `make lint`
6. Create pull request

### Code Quality Standards
- TypeScript for all code
- 80%+ test coverage
- ESLint/Prettier formatting
- Type checking with mypy/tsc

## 📱 Mobile Development

### React Native Setup
```bash
# Install Expo CLI
npm install -g @expo/cli

# Start Expo development server
cd frontend-expo-backup
npx expo start

# Run on iOS/Android
npx expo run:ios
npx expo run:android
```

## 🔒 Security

- Row Level Security (RLS) with Supabase
- Environment variable protection
- API rate limiting
- Input validation and sanitization

## 📊 Monitoring

### Health Checks
```bash
# Check all services
make health

# View service status
make status

# Monitor logs
make logs
```

### Performance
- Bundle size monitoring
- Database query optimization
- Cache hit rate tracking
- API response time monitoring

## 🚢 Deployment

### Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## 📚 Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [CLAUDE.md](./CLAUDE.md) - Detailed development guidelines
- [Architecture Guide](./docs/architecture.md) - System architecture
- [Testing Guide](./docs/testing.md) - Comprehensive testing strategy

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Clean Docker resources
make clean

# Reset entire environment  
make clean-volumes  # WARNING: Deletes all data

# Rebuild containers
make build
```

#### Database Issues
```bash
# Reset database
make db-reset

# Check database connection
make shell-db

# View database logs
make logs-db
```

#### Port Conflicts
```bash
# Check which ports are in use
lsof -i :5173  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database

# Stop conflicting services
make down
```

### Getting Help
- Check the [issues page](https://github.com/your-username/tokuteigino/issues)
- Read the [troubleshooting guide](./docs/troubleshooting.md)
- Contact the development team

---

**Made with ❤️ for foreign workers preparing for Japan's Specified Skills exam**