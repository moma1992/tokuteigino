#!/bin/bash

# Docker環境チェックスクリプト
# Usage: ./scripts/check-docker.sh

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

# Check Docker installation
check_docker() {
    log_info "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_success "Docker is installed: $DOCKER_VERSION"
    else
        log_error "Docker is not installed"
        log_info "Please install Docker from: https://www.docker.com/products/docker-desktop/"
        exit 1
    fi
}

# Check Docker Compose installation
check_docker_compose() {
    log_info "Checking Docker Compose installation..."
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log_success "Docker Compose is installed: $COMPOSE_VERSION"
    elif docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version)
        log_success "Docker Compose (v2) is installed: $COMPOSE_VERSION"
    else
        log_error "Docker Compose is not installed"
        exit 1
    fi
}

# Check Docker daemon
check_docker_daemon() {
    log_info "Checking Docker daemon status..."
    
    if docker info &> /dev/null; then
        log_success "Docker daemon is running"
    else
        log_error "Docker daemon is not running"
        log_info "Please start Docker Desktop or run: sudo systemctl start docker"
        exit 1
    fi
}

# Check Docker Compose file syntax
check_compose_syntax() {
    log_info "Checking Docker Compose file syntax..."
    
    if [ -f "docker-compose.yml" ]; then
        if docker-compose config &> /dev/null || docker compose config &> /dev/null; then
            log_success "docker-compose.yml syntax is valid"
        else
            log_error "docker-compose.yml has syntax errors"
            log_info "Run 'docker-compose config' to see details"
            exit 1
        fi
    else
        log_error "docker-compose.yml not found"
        exit 1
    fi
}

# Check environment file
check_env_file() {
    log_info "Checking environment configuration..."
    
    if [ -f ".env" ]; then
        log_success ".env file exists"
    else
        log_warning ".env file not found"
        if [ -f ".env.example" ]; then
            log_info "Creating .env from .env.example..."
            cp .env.example .env
            log_success ".env file created from template"
            log_warning "Please edit .env file with your actual configuration values"
        else
            log_error ".env.example not found"
            exit 1
        fi
    fi
}

# Test Docker functionality
test_docker() {
    log_info "Testing Docker functionality..."
    
    if docker run --rm hello-world &> /dev/null; then
        log_success "Docker is working correctly"
    else
        log_error "Docker test failed"
        exit 1
    fi
}

# Check required ports
check_ports() {
    log_info "Checking if required ports are available..."
    
    PORTS=(5432 6379 8000 19000 5050)
    
    for port in "${PORTS[@]}"; do
        if lsof -i :$port &> /dev/null; then
            log_warning "Port $port is already in use"
        else
            log_success "Port $port is available"
        fi
    done
}

# Check disk space
check_disk_space() {
    log_info "Checking disk space..."
    
    AVAILABLE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "${AVAILABLE%.*}" -gt 10 ]; then
        log_success "Sufficient disk space available: ${AVAILABLE}G"
    else
        log_warning "Low disk space: ${AVAILABLE}G (recommend >10GB)"
    fi
}

# Main execution
main() {
    echo "🐳 Docker Environment Check"
    echo "=========================="
    echo ""
    
    check_docker
    check_docker_compose
    check_docker_daemon
    check_compose_syntax
    check_env_file
    test_docker
    check_ports
    check_disk_space
    
    echo ""
    echo "🎉 Docker environment check completed!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Run: make dev"
    echo "3. Access services at:"
    echo "   - Frontend: http://localhost:19000"
    echo "   - Backend: http://localhost:8000"
    echo "   - pgAdmin: http://localhost:5050"
}

# Run main function
main "$@"