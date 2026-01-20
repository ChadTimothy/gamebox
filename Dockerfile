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

# Stage 2: Build server
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy server source
COPY server/ ./

# Build server with increased memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules

# Copy server data files (word lists, etc.)
COPY --from=server-builder /app/server/src/data ./server/src/data

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
