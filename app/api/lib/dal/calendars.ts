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
  kindeUserId?: string | null
}): Promise<Calendar[]> {
  return prisma.calendar.findMany({
    where: {
      ...(options?.isArchived !== undefined && { isArchived: options.isArchived }),
      ...(options?.isPublished !== undefined && { isPublished: options.isPublished }),
      ...(options?.kindeUserId !== undefined && { kindeUserId: options.kindeUserId })
    },
    orderBy: { year: 'desc' }
  })
}

/**
 * Get a calendar by year with optional picture inclusion and user filtering
 * - If kindeUserId is undefined: Returns calendar regardless of assignment (admin access)
 * - If kindeUserId is provided: Returns calendar only if assigned to that user
 */
export async function getCalendarByYear(
  year: number,
  includePictures = false,
  kindeUserId?: string
): Promise<Calendar & { pictures?: any[] } | null> {
  const calendar = await prisma.calendar.findUnique({
    where: { year },
    include: {
      pictures: includePictures ? { orderBy: { day: 'asc' } } : false
    }
  })

  // If kindeUserId is provided, check if user has access to this calendar
  if (calendar && kindeUserId !== undefined) {
    // User can only access calendars assigned to them (exact match required)
    if (calendar.kindeUserId !== kindeUserId) {
      return null
    }
  }

  return calendar
}

/**
 * Get the most recent calendar with optional user filtering
 * - If kindeUserId is undefined: Returns latest calendar regardless of assignment (admin access)
 * - If kindeUserId is provided: Returns latest calendar only if assigned to that user
 */
export async function getLatestCalendar(
  includePictures = false,
  kindeUserId?: string
): Promise<Calendar & { pictures?: any[] } | null> {
  return prisma.calendar.findFirst({
    where: {
      isPublished: true,
      // If kindeUserId provided, only get calendars assigned to that user
      ...(kindeUserId !== undefined && { kindeUserId: kindeUserId })
    },
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
