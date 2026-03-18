# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine AS base

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM base AS production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app (if using TypeScript)
RUN npm run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the app
CMD ["npm", "start"]