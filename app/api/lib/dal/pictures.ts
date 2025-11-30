/**
 * Picture Data Access Layer
 * Handles all database operations related to pictures
 */

import { prisma } from '@api/lib/prisma'
import type { Picture, Calendar } from '@prisma/client'

export async function getAllPicturesByCalendarId(calendarId: number): Promise<Picture[]> {
  return prisma.picture.findMany({
    where: { calendarId },
    orderBy: { day: 'asc' }
  })
}

export async function updatePictureOpenStatus(day: number, calendarId: number, isOpen: boolean) {
  return prisma.picture.update({
    where: {
      day_calendarId: { day, calendarId }
    },
    data: { isOpen }
  })
}

export async function createPictures(pictures: Omit<Picture, 'id'>[]) {
  return prisma.picture.createMany({
    data: pictures
  })
}

/**
 * Get the test/fake calendar
 * Used for public test page
 */
export async function getTestCalendar(): Promise<Calendar | null> {
  return prisma.calendar.findFirst({
    where: {
      isFake: true,
      isPublished: true
    }
  })
}