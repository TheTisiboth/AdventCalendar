/**
 * Picture Data Access Layer
 * Handles all database operations related to pictures
 */

import { prisma } from '@api/lib/prisma'
import type { Picture } from '@prisma/client'

export async function getAllPictures(): Promise<Picture[]> {
  return prisma.picture.findMany({
    orderBy: { day: 'asc' }
  })
}

export async function getPictureByDay(day: number) {
  return prisma.picture.findUnique({
    where: { day }
  })
}

export async function updatePictureOpenStatus(day: number, isOpen: boolean) {
  return prisma.picture.update({
    where: { day },
    data: { isOpen }
  })
}

export async function createPictures(pictures: Omit<Picture, 'id'>[]) {
  return prisma.picture.createMany({
    data: pictures
  })
}

export async function deleteAllPictures() {
  return prisma.picture.deleteMany()
}

export async function getPictureCount() {
  return prisma.picture.count()
}
