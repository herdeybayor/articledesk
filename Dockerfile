# Use Node.js LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for better SQLite support
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p logs && \
    chown -R nodeuser:nodejs /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application using the production script approach
CMD ["sh", "-c", "node src/index.js & node src/cron-fetch.js & wait"] 