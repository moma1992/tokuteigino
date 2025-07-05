# Vite + React + TypeScript Development Dockerfile
FROM node:20-slim

# Install system dependencies needed for Playwright
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodeuser && \
    useradd -r -u 1001 -g nodeuser nodeuser

# Set working directory
WORKDIR /app

# Set environment variables for Playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin/
ENV CI=true

# Copy package files with correct ownership
COPY --chown=nodeuser:nodeuser package*.json ./

# Install dependencies as root (needed for some packages)
RUN npm install

# Copy source code with correct ownership
COPY --chown=nodeuser:nodeuser . .

# Change ownership of node_modules to nodeuser
RUN chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Expose ports for Vite dev server
EXPOSE 5173

# Default command for development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]