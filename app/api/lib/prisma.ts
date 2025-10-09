import { PrismaClient } from '@prisma/client'

interface PrismaCache {
  client: PrismaClient | null
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaCache: PrismaCache | undefined
}

const cached: PrismaCache = global.prismaCache || { client: null }

if (!global.prismaCache) {
  global.prismaCache = cached
}

function getPrismaClient() {
  if (!cached.client) {
    cached.client = new PrismaClient()
  }
  return cached.client
}

export const prisma = getPrismaClient()
