# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

# Recommended for Next.js on Alpine
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
WORKDIR /app

# Enable corepack (pnpm)
RUN corepack enable

# Install deps (only package manager files for better caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm exec next build

# Runtime stage
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
