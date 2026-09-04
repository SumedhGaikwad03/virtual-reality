# syntax=docker/dockerfile:1

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy TypeScript and Prisma configuration before generating client
COPY tsconfig.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source and compile TypeScript
COPY src ./src
RUN npm run build

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript, generated Prisma client, and configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Run as non-root user for security
USER node

EXPOSE 10000

CMD ["node", "dist/src/server.js"]
