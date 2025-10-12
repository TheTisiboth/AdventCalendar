# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for build
ENV NEXT_TELEMETRY_DISABLED 1

# Build args (required for Next.js build)
ARG NEXT_PUBLIC_CDN_URL
ARG KINDE_CLIENT_ID
ARG KINDE_CLIENT_SECRET
ARG KINDE_ISSUER_URL
ARG KINDE_SITE_URL
ARG KINDE_POST_LOGOUT_REDIRECT_URL
ARG KINDE_POST_LOGIN_REDIRECT_URL

ENV NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL}
ENV KINDE_CLIENT_ID=${KINDE_CLIENT_ID}
ENV KINDE_CLIENT_SECRET=${KINDE_CLIENT_SECRET}
ENV KINDE_ISSUER_URL=${KINDE_ISSUER_URL}
ENV KINDE_SITE_URL=${KINDE_SITE_URL}
ENV KINDE_POST_LOGOUT_REDIRECT_URL=${KINDE_POST_LOGOUT_REDIRECT_URL}
ENV KINDE_POST_LOGIN_REDIRECT_URL=${KINDE_POST_LOGIN_REDIRECT_URL}

# Build the application (Prisma client already generated in deps stage)
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install bash and openssl for running migration script and Prisma
RUN apk add --no-cache bash openssl

# Copy necessary files from builder with correct ownership (much faster than chown -R)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and install production dependencies for migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json* ./

# Copy startup script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

# Install production dependencies (includes Prisma for migrations)
RUN --mount=type=cache,target=/home/nextjs/.npm,uid=1001,gid=1001 \
    npm ci --omit=dev

EXPOSE 3003

ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

CMD ["./docker-entrypoint.sh"]
