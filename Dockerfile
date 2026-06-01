# syntax=docker/dockerfile:1

# ---- Build Stage ----
FROM node:22-slim AS builder

RUN apt-get update -y && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null; npm ci 2>/dev/null || npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ---- Runtime Stage ----
FROM node:22-slim AS runner

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Data directory (mounted at runtime)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health',function(r){process.exit(r.statusCode===200?0:1)})"

CMD ["node", "server.js"]
