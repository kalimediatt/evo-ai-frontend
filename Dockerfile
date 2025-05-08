# Build stage
FROM node:20.15.1-alpine AS builder

WORKDIR /app

# Define build arguments with default values
ARG NEXT_PUBLIC_API_URL=https://api.evo-ai.co

# Install dependencies first (caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables from build arguments
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Production stage
FROM node:20.15.1-alpine AS runner

WORKDIR /app

# Define build arguments again for the runner stage
ARG NEXT_PUBLIC_API_URL=https://api.evo-ai.co

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
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 