# ==============================================================================
# KAABIL (काबिल) — Multi-Stage Production Dockerfile
# Node.js 20 LTS Alpine Image with Non-Root Security & Minimal Attack Surface
# ==============================================================================

# Stage 1: Base setup
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Run Production Next.js Build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 4: Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root application user for least-privilege security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application and required assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.dev-store ./.dev-store

# Permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Health check probe using native Node.js HTTP request
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1));"

CMD ["npm", "run", "start"]
