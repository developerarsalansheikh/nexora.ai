# Multi-Stage Node.js 20 Production Dockerfile for Nexora.ai Server
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Production Execution Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup -g 1001 -S nexora && \
    adduser -u 1001 -S nexora -G nexora

COPY --from=builder /app /app

USER nexora

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/index.js"]
