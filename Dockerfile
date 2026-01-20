# Stage 1: Build web assets
FROM node:20-alpine AS web-builder

WORKDIR /app/web

# Copy web package files
COPY web/package*.json ./

# Install dependencies
RUN npm ci

# Copy web source
COPY web/ ./

# Build web assets
RUN npm run build

# Stage 2: Server dependencies only (no build - use pre-built dist)
FROM node:20-alpine AS server-deps

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Stage 3: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy server with pre-built dist (built locally before deploy)
COPY server/dist ./server/dist
COPY server/package*.json ./server/
COPY --from=server-deps /app/server/node_modules ./server/node_modules

# Copy server data files (word lists, etc.)
COPY server/src/data ./server/src/data

# Copy built web assets
COPY --from=web-builder /app/web/dist ./web/dist

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Start server
CMD ["node", "dist/index.js"]
