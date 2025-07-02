#!/bin/bash

# TOKUTEI Learning - Development Script
# Quick setup and management for development environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if required files exist
check_requirements() {
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml not found. Please run this script from the project root."
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f ".env" ]; then
        log_info "Creating .env file from template..."
        cat > .env << EOF
# Environment Configuration
NODE_ENV=development
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tokuteigino
POSTGRES_DB=tokuteigino
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# Email (for testing)
EMAIL_HOST=localhost
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# App URLs
FRONTEND_URL=http://localhost:19000
BACKEND_URL=http://localhost:8000
EOF
        log_warning "Please edit .env file with your actual configuration values"
    else
        log_info ".env file already exists"
    fi
}

# Build containers
build_containers() {
    log_info "Building Docker containers..."
    docker-compose build
    log_success "Containers built successfully"
}

# Start services
start_services() {
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services started successfully!"
        echo ""
        echo "🚀 Development environment is ready!"
        echo ""
        echo "📱 Frontend (Expo): http://localhost:19000"
        echo "🔧 Backend API: http://localhost:8000"
        echo "🗄️  Database: localhost:5432"
        echo "📊 pgAdmin: http://localhost:5050 (admin@example.com / admin)"
        echo "⚡ Redis: localhost:6379"
        echo ""
        echo "💡 Useful commands:"
        echo "  make logs          - View all logs"
        echo "  make shell-backend - Access backend shell"
        echo "  make shell-frontend - Access frontend shell"
        echo "  make test          - Run tests"
        echo "  make down          - Stop services"
    else
        log_error "Some services failed to start"
        docker-compose ps
        exit 1
    fi
}

# Stop services
stop_services() {
    log_info "Stopping services..."
    docker-compose down
    log_success "Services stopped"
}

# Show logs
show_logs() {
    docker-compose logs -f
}

# Run tests
run_tests() {
    log_info "Running tests in development containers..."
    log_info "Starting services if not running..."
    docker-compose up -d postgres redis backend frontend
    sleep 10
    
    log_info "Running backend tests..."
    docker-compose exec -T backend bash -c "cd /app && pip install pytest pytest-cov && python -m pytest -v --tb=short" || true
    
    log_info "Running frontend tests..."
    docker-compose exec -T frontend npm test -- --run --passWithNoTests || true
    
    log_success "Tests completed"
}

# Reset environment
reset_env() {
    log_warning "This will reset the entire development environment"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Resetting environment..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        build_containers
        start_services
        log_success "Environment reset complete"
    else
        log_info "Reset cancelled"
    fi
}

# Show help
show_help() {
    echo "TOKUTEI Learning - Development Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Initial setup (creates .env, builds containers, starts services)"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show logs for all services"
    echo "  test      - Run all tests"
    echo "  build     - Build all containers"
    echo "  reset     - Reset entire environment (WARNING: deletes all data)"
    echo "  status    - Show status of all services"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # First time setup"
    echo "  $0 start     # Start development environment"
    echo "  $0 test      # Run tests"
}

# Show status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    echo ""
    log_info "Health Check:"
    curl -f http://localhost:8000/health 2>/dev/null && echo "✅ Backend is healthy" || echo "❌ Backend is down"
    curl -f http://localhost:19000/ 2>/dev/null && echo "✅ Frontend is healthy" || echo "❌ Frontend is down"
    docker-compose exec postgres pg_isready -U postgres 2>/dev/null && echo "✅ Database is healthy" || echo "❌ Database is down"
}

# Main script
main() {
    check_docker
    check_requirements
    
    case "${1:-help}" in
        setup)
            setup_env
            build_containers
            start_services
            ;;
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            start_services
            ;;
        logs)
            show_logs
            ;;
        test)
            run_tests
            ;;
        build)
            build_containers
            ;;
        reset)
            reset_env
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"