# Vite + React + TypeScript Development Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install minimal system dependencies
RUN apk add --no-cache git bash curl

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