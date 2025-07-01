# React Native + Expo Development Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install minimal system dependencies
RUN apk add --no-cache git bash curl

# Install Expo CLI only
RUN npm install -g @expo/cli@latest

# Copy package files
COPY package*.json ./

# Install dependencies with npm (simpler than yarn)
RUN npm install

# Copy source code
COPY . .

# Expose ports for Expo
EXPOSE 8081 8082 19000 19001 19002

# Default command for development
CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0", "--port", "8082"]