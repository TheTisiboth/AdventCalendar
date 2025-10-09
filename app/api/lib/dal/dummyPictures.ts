/**
 * Dummy Picture Data Access Layer
 * Handles all database operations related to dummy pictures
 */

import { prisma } from '@api/lib/prisma'
import type { DummyPicture } from '@prisma/client'

export async function getAllDummyPictures(): Promise<DummyPicture[]> {
  return prisma.dummyPicture.findMany({
    orderBy: { day: 'asc' }
  })
}

export async function getDummyPictureByDay(day: number) {
  return prisma.dummyPicture.findUnique({
    where: { day }
  })
}

export async function updateDummyPictureOpenStatus(day: number, isOpen: boolean) {
  return prisma.dummyPicture.update({
    where: { day },
    data: { isOpen }
  })
}

export async function createDummyPictures(pictures: Omit<DummyPicture, 'id'>[]) {
  return prisma.dummyPicture.createMany({
    data: pictures
  })
}

export async function deleteAllDummyPictures() {
  return prisma.dummyPicture.deleteMany()
}

export async function getDummyPictureCount() {
  return prisma.dummyPicture.count()
}
