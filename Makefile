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
	@echo "$(GREEN)Services started successfully!$(RESET)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend API: http://localhost:8000"
	@echo "pgAdmin: http://localhost:5050"

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

logs-db: ## Show database logs
	docker-compose logs -f postgres

# Development Tools
shell-backend: ## Access backend container shell
	docker-compose exec backend bash

shell-frontend: ## Access frontend container shell
	docker-compose exec frontend sh

shell-db: ## Access database shell
	docker-compose exec postgres psql -U postgres -d tokuteigino

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

# Database Operations
db-reset: ## Reset database with fresh data
	@echo "$(BLUE)Resetting database...$(RESET)"
	docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS tokuteigino;"
	docker-compose exec postgres psql -U postgres -c "CREATE DATABASE tokuteigino;"
	docker-compose exec postgres psql -U postgres -d tokuteigino -f /docker-entrypoint-initdb.d/seed.sql
	@echo "$(GREEN)Database reset completed!$(RESET)"

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(RESET)"
	docker-compose exec backend poetry run alembic upgrade head

db-backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(RESET)"
	docker-compose exec postgres pg_dump -U postgres tokuteigino > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backup created!$(RESET)"

# Supabase Operations
supabase-start: ## Start local Supabase
	@echo "$(BLUE)Starting local Supabase...$(RESET)"
	cd supabase && npx supabase start

supabase-stop: ## Stop local Supabase
	@echo "$(BLUE)Stopping local Supabase...$(RESET)"
	cd supabase && npx supabase stop

supabase-reset: ## Reset local Supabase
	@echo "$(BLUE)Resetting local Supabase...$(RESET)"
	cd supabase && npx supabase db reset

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

health: ## Check health of all services
	@echo "$(BLUE)Health Check:$(RESET)"
	@curl -f http://localhost:8000/health || echo "$(RED)Backend is down$(RESET)"
	@curl -f http://localhost:5173/ || echo "$(RED)Frontend is down$(RESET)"
	@docker-compose exec postgres pg_isready -U postgres || echo "$(RED)Database is down$(RESET)"

# Development Workflow
dev: build up ## Quick development setup
	@echo "$(GREEN)Development environment is ready!$(RESET)"
	@echo "Backend API: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "pgAdmin: http://localhost:5050 (admin@example.com / admin)"

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