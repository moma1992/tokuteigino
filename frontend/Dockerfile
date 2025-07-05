# Vite + React + TypeScript Development Dockerfile
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for Playwright
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin/
ENV CI=true

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports for Vite dev server
EXPOSE 5173

# Default command for development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]