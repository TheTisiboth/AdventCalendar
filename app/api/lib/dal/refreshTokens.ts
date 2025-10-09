/**
 * Refresh Token Data Access Layer
 * Handles all database operations related to refresh tokens
 */

import { prisma } from '@api/lib/prisma'

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token }
  })
}

export async function createRefreshToken(token: string) {
  return prisma.refreshToken.create({
    data: { token }
  })
}

export async function deleteRefreshToken(token: string) {
  return prisma.refreshToken.deleteMany({
    where: { token }
  })
}
