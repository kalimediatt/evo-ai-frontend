# Build stage
FROM node:20.15.1-alpine AS builder

WORKDIR /app

# Install dependencies first (caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

RUN npm run build

# Production stage
FROM node:20.15.1-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
