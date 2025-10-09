/**
 * User Data Access Layer
 * Handles all database operations related to users
 */

import { prisma } from '@api/lib/prisma'

export async function findUserByName(name: string) {
  return prisma.user.findUnique({
    where: { name }
  })
}

export async function createUser(data: { name: string; password: string; role: string }) {
  return prisma.user.create({ data })
}

export async function getUserCount() {
  return prisma.user.count()
}
