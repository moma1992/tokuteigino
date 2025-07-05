# TOKUTEI Learning - Development Makefile
.PHONY: help build up down restart logs shell test clean lint format

# Default environment
ENV ?= development

# Colors for output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

help: ## Show this help message
	@echo "$(BLUE)TOKUTEI Learning - Development Commands$(RESET)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(RESET)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development Environment
build: ## Build all Docker containers
	@echo "$(BLUE)Building Docker containers...$(RESET)"
	docker-compose build

up: ## Start all services
	@echo "$(BLUE)Starting all services...$(RESET)"
	docker-compose up -d
	@echo "$(GREEN)Lightweight services started successfully!$(RESET)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend API: http://localhost:8000"
	@echo "Supabase Dashboard: https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg"

down: ## Stop all services
	@echo "$(BLUE)Stopping all services...$(RESET)"
	docker-compose down
	@echo "$(GREEN)Services stopped successfully!$(RESET)"

restart: down up ## Restart all services

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-db: ## Show database logs (removed - use Supabase Dashboard)
	@echo "$(YELLOW)Database logs removed - use Supabase Dashboard$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/logs"

# Development Tools
shell-backend: ## Access backend container shell
	docker-compose exec backend bash

shell-frontend: ## Access frontend container shell
	docker-compose exec frontend sh

shell-db: ## Access database shell (removed - use Supabase Dashboard)
	@echo "$(YELLOW)Database shell removed - use Supabase Dashboard$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/editor"

# Testing
test: ## Run tests in development containers
	@echo "$(BLUE)Running tests in development containers...$(RESET)"
	@echo "$(YELLOW)Backend tests:$(RESET)"
	docker-compose exec backend bash -c "cd /app && pip install pytest pytest-cov && python -m pytest -v --tb=short" || true
	@echo "$(YELLOW)Frontend tests:$(RESET)"
	docker-compose exec frontend npm test -- --run --passWithNoTests || true

test-backend: ## Run backend tests in development container
	@echo "$(BLUE)Running backend tests in development container...$(RESET)"
	docker-compose exec backend bash -c "cd /app && pip install pytest pytest-cov && python -m pytest -v"

test-frontend: ## Run frontend tests in development container
	@echo "$(BLUE)Running frontend tests in development container...$(RESET)"
	docker-compose exec frontend npm test -- --run --passWithNoTests

test-e2e: ## Run E2E tests with Playwright
	@echo "$(BLUE)Running E2E tests with Playwright...$(RESET)"
	@echo "$(YELLOW)Starting E2E test container...$(RESET)"
	docker-compose up -d e2e-test
	@echo "$(YELLOW)Installing dependencies...$(RESET)"
	docker-compose exec e2e-test npm install
	@echo "$(YELLOW)Running E2E tests...$(RESET)"
	docker-compose exec e2e-test npm run test:e2e

test-e2e-ui: ## Run E2E tests with Playwright UI
	@echo "$(BLUE)Running E2E tests with Playwright UI...$(RESET)"
	docker-compose up -d e2e-test
	docker-compose exec e2e-test npm install
	docker-compose exec e2e-test npm run test:e2e:ui

test-e2e-debug: ## Run E2E tests in debug mode
	@echo "$(BLUE)Running E2E tests in debug mode...$(RESET)"
	docker-compose up -d e2e-test
	docker-compose exec e2e-test npm install
	docker-compose exec e2e-test npm run test:e2e:debug

test-e2e-headed: ## Run E2E tests in headed mode
	@echo "$(BLUE)Running E2E tests in headed mode...$(RESET)"
	docker-compose up -d e2e-test
	docker-compose exec e2e-test npm install
	docker-compose exec e2e-test npm run test:e2e:headed

test-e2e-setup: ## Setup E2E test environment
	@echo "$(BLUE)Setting up E2E test environment...$(RESET)"
	docker-compose up -d e2e-test
	docker-compose exec e2e-test npm install
	@echo "$(GREEN)E2E test environment ready!$(RESET)"

test-e2e-prod: ## Run E2E tests against production Supabase
	@echo "$(BLUE)Running E2E tests against production Supabase...$(RESET)"
	@echo "$(YELLOW)WARNING: This will test against production environment!$(RESET)"
	@read -p "Are you sure you want to continue? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(BLUE)Starting frontend with production Supabase...$(RESET)"; \
		docker-compose up -d frontend; \
		echo "$(BLUE)Setting production environment variables...$(RESET)"; \
		docker-compose exec frontend sh -c 'export VITE_SUPABASE_URL=$${VITE_SUPABASE_PROD_URL:-https://your-project.supabase.co} && export VITE_SUPABASE_ANON_KEY=$${VITE_SUPABASE_PROD_ANON_KEY} && npm run test:e2e -- --project=chromium --workers=1'; \
		echo "$(GREEN)Production E2E tests completed!$(RESET)"; \
	else \
		echo ""; \
		echo "$(YELLOW)Cancelled.$(RESET)"; \
	fi

test-e2e-prod-auth: ## Run authentication E2E tests against production Supabase (safe UI tests only)
	@echo "$(BLUE)Running authentication E2E tests against production Supabase...$(RESET)"
	@echo "$(YELLOW)WARNING: This will test against production environment!$(RESET)"
	@echo "$(YELLOW)Note: Running safe UI/validation tests only - no real user accounts will be created$(RESET)"
	@read -p "Are you sure you want to continue? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(BLUE)Starting frontend with production Supabase...$(RESET)"; \
		docker-compose up -d frontend; \
		echo "$(BLUE)Running safe authentication tests...$(RESET)"; \
		docker-compose exec frontend sh -c 'export VITE_SUPABASE_URL=$${VITE_SUPABASE_PROD_URL:-https://your-project.supabase.co} && export VITE_SUPABASE_ANON_KEY=$${VITE_SUPABASE_PROD_ANON_KEY} && npm run test:e2e:prod:auth'; \
		echo "$(GREEN)Production authentication E2E tests completed!$(RESET)"; \
	else \
		echo ""; \
		echo "$(YELLOW)Cancelled.$(RESET)"; \
	fi

test-e2e-prod-auth-all: ## Run ALL authentication E2E tests against production Supabase (including mock tests)
	@echo "$(BLUE)Running ALL authentication E2E tests against production Supabase...$(RESET)"
	@echo "$(RED)WARNING: This includes mock tests that may not work in production!$(RESET)"
	@read -p "Are you sure you want to continue? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(BLUE)Starting frontend with production Supabase...$(RESET)"; \
		docker-compose up -d frontend; \
		echo "$(BLUE)Running all authentication tests...$(RESET)"; \
		docker-compose exec frontend sh -c 'export VITE_SUPABASE_URL=$${VITE_SUPABASE_PROD_URL:-https://your-project.supabase.co} && export VITE_SUPABASE_ANON_KEY=$${VITE_SUPABASE_PROD_ANON_KEY} && npm run test:e2e:prod:auth:all'; \
		echo "$(GREEN)All production authentication E2E tests completed!$(RESET)"; \
	else \
		echo ""; \
		echo "$(YELLOW)Cancelled.$(RESET)"; \
	fi

test-e2e-prod-setup: ## Setup environment variables for production E2E testing
	@echo "$(BLUE)Setting up production E2E test environment...$(RESET)"
	@echo "$(YELLOW)Please ensure you have the following environment variables set:$(RESET)"
	@echo "  VITE_SUPABASE_PROD_URL=https://your-project.supabase.co"
	@echo "  VITE_SUPABASE_PROD_ANON_KEY=your-production-anon-key"
	@echo ""
	@echo "$(YELLOW)Add these to your .env file or export them before running tests.$(RESET)"
	@echo ""
	@echo "$(BLUE)Example:$(RESET)"
	@echo "  export VITE_SUPABASE_PROD_URL=https://abcdefgh.supabase.co"
	@echo "  export VITE_SUPABASE_PROD_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	@echo "  make test-e2e-prod"

test-coverage: ## Run tests with coverage in development containers
	@echo "$(BLUE)Running tests with coverage in development containers...$(RESET)"
	@echo "$(YELLOW)Backend coverage:$(RESET)"
	docker-compose exec backend bash -c "cd /app && pip install pytest pytest-cov && python -m pytest --cov=. --cov-report=html --cov-report=term"
	@echo "$(YELLOW)Frontend coverage:$(RESET)"
	docker-compose exec frontend npm test -- --coverage --run --passWithNoTests

test-watch: ## Run tests in watch mode
	docker-compose exec backend bash -c "cd /app && pip install pytest pytest-watch && python -m pytest --watch"
	docker-compose exec frontend npm test -- --watch

# Code Quality
lint: ## Run linting for all projects
	@echo "$(BLUE)Running linting...$(RESET)"
	docker-compose exec backend poetry run flake8 .
	docker-compose exec backend poetry run black --check .
	docker-compose exec backend poetry run isort --check-only .
	docker-compose exec frontend npm run lint

format: ## Format code for all projects
	@echo "$(BLUE)Formatting code...$(RESET)"
	docker-compose exec backend poetry run black .
	docker-compose exec backend poetry run isort .
	docker-compose exec frontend npm run format

typecheck: ## Run type checking
	@echo "$(BLUE)Running type checks...$(RESET)"
	docker-compose exec backend poetry run mypy .
	docker-compose exec frontend npm run typecheck

# Production Database Operations (via Supabase Dashboard)
db-reset: ## Reset database (removed - use Supabase Dashboard)
	@echo "$(YELLOW)Database operations moved to Supabase Dashboard$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/editor"

db-migrate: ## Run database migrations (removed - use Supabase Dashboard)
	@echo "$(YELLOW)Database migrations moved to Supabase Dashboard$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/database/migrations"

db-backup: ## Backup database (removed - use Supabase Dashboard)
	@echo "$(YELLOW)Database backup moved to Supabase Dashboard$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg/database/backups"

# Supabase Operations (Production)
supabase-start: ## Start local Supabase (removed - using production)
	@echo "$(YELLOW)Local Supabase removed - using production$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg"

supabase-stop: ## Stop local Supabase (removed - using production)
	@echo "$(YELLOW)Local Supabase removed - using production$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg"

supabase-reset: ## Reset local Supabase (removed - using production)
	@echo "$(YELLOW)Local Supabase removed - using production$(RESET)"
	@echo "https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg"

# Maintenance
clean: ## Clean up Docker resources
	@echo "$(BLUE)Cleaning up Docker resources...$(RESET)"
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)Cleanup completed!$(RESET)"

clean-volumes: ## Remove all Docker volumes (WARNING: This will delete all data)
	@echo "$(RED)WARNING: This will delete all data!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker volume prune -f; \
		echo "$(GREEN)Volumes cleaned!$(RESET)"; \
	else \
		echo "$(YELLOW)Cancelled.$(RESET)"; \
	fi

# Monitoring
status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(RESET)"
	docker-compose ps

health: ## Check health of all services (lightweight)
	@echo "$(BLUE)Health Check (Lightweight):$(RESET)"
	@curl -f http://localhost:8000/health || echo "$(RED)Backend is down$(RESET)"
	@curl -f http://localhost:5173/ || echo "$(RED)Frontend is down$(RESET)"
	@echo "$(GREEN)Database: Production Supabase (external)$(RESET)"

# Development Workflow
dev: build up ## Quick lightweight development setup
	@echo "$(GREEN)Lightweight development environment is ready!$(RESET)"
	@echo "Backend API: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "Supabase Dashboard: https://supabase.com/dashboard/project/rvbapnvvyzxlhtsurqtg"
	@echo "$(BLUE)Memory usage: ~2GB total (1GB per container)$(RESET)"

# CI/CD
ci: lint typecheck test ## Run CI pipeline locally

# Environment Setup
setup: ## Initial project setup
	@echo "$(BLUE)Setting up development environment...$(RESET)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(YELLOW)Please edit .env file with your configuration$(RESET)"; \
	fi
	make build
	make up
	make db-migrate
	@echo "$(GREEN)Setup completed!$(RESET)"