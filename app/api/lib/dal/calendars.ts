/**
 * Calendar Data Access Layer
 * Handles all database operations related to calendars
 */

import { prisma } from '@api/lib/prisma'
import type { Calendar } from '@prisma/client'

/**
 * Get all calendars with optional filtering
 */
export async function getAllCalendars(options?: {
  isArchived?: boolean
  isPublished?: boolean
}): Promise<Calendar[]> {
  return prisma.calendar.findMany({
    where: {
      ...(options?.isArchived !== undefined && { isArchived: options.isArchived }),
      ...(options?.isPublished !== undefined && { isPublished: options.isPublished })
    },
    orderBy: { year: 'desc' }
  })
}

/**
 * Get a calendar by year with optional picture inclusion
 */
export async function getCalendarByYear(
  year: number,
  includePictures = false
): Promise<Calendar & { pictures?: any[] } | null> {
  return prisma.calendar.findUnique({
    where: { year },
    include: {
      pictures: includePictures ? { orderBy: { day: 'asc' } } : false
    }
  })
}

/**
 * Get the most recent calendar
 */
export async function getLatestCalendar(includePictures = false): Promise<Calendar & { pictures?: any[] } | null> {
  return prisma.calendar.findFirst({
    where: { isPublished: true },
    orderBy: { year: 'desc' },
    include: {
      pictures: includePictures ? { orderBy: { day: 'asc' } } : false
    }
  })
}

/**
 * Create a new calendar
 */
export async function createCalendar(
  data: Omit<Calendar, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Calendar> {
  return prisma.calendar.create({
    data
  })
}

/**
 * Update an existing calendar
 */
export async function updateCalendar(
  year: number,
  data: Partial<Omit<Calendar, 'id' | 'year' | 'createdAt' | 'updatedAt'>>
): Promise<Calendar> {
  return prisma.calendar.update({
    where: { year },
    data
  })
}
