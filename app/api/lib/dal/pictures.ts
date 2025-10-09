/**
 * Picture Data Access Layer
 * Handles all database operations related to pictures
 */

import { prisma } from '@api/lib/prisma'
import type { Picture } from '@prisma/client'

export async function getAllPictures(year: number): Promise<Picture[]> {
  return prisma.picture.findMany({
    where: { year },
    orderBy: { day: 'asc' }
  })
}

export async function updatePictureOpenStatus(day: number, year: number, isOpen: boolean) {
  return prisma.picture.update({
    where: {
      day_year: { day, year }
    },
    data: { isOpen }
  })
}

export async function createPictures(pictures: Omit<Picture, 'id'>[]) {
  return prisma.picture.createMany({
    data: pictures
  })
}