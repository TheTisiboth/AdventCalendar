# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for build
ENV NEXT_TELEMETRY_DISABLED 1

# Build args (dummy values for Next.js validation during build)
ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET
ARG DATABASE_URL

ENV ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
ENV REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install bash for running migration script
RUN apk add --no-cache bash

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy startup script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3003

ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

CMD ["./docker-entrypoint.sh"]
