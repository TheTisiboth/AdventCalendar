/**
 * Calendar Data Access Layer
 * Handles all database operations related to calendars
 */

import { prisma } from '@api/lib/prisma'
import type { Calendar, Picture } from '@prisma/client'

/**
 * Get all calendars with optional filtering
 * By default, excludes fake/test calendars
 */
export async function getAllCalendars(options?: {
  archived?: boolean // if true, returns only past years; if false, returns only current year; if undefined, returns all
  isPublished?: boolean
  kindeUserId?: string | null
  includeFake?: boolean // if true, includes fake calendars; defaults to false
}): Promise<Calendar[]> {
  const currentYear = new Date().getFullYear()

  return prisma.calendar.findMany({
    where: {
      ...(options?.archived === true && { year: { lt: currentYear } }),
      ...(options?.archived === false && { year: currentYear }),
      ...(options?.isPublished !== undefined && { isPublished: options.isPublished }),
      ...(options?.kindeUserId !== undefined && { kindeUserId: options.kindeUserId }),
      ...(!options?.includeFake && { isFake: false }) // Exclude fake calendars by default
    },
    orderBy: { year: 'desc' }
  })
}

/**
 * Get a calendar by ID with optional picture inclusion and user filtering
 * - If kindeUserId is undefined: Returns calendar regardless of assignment (admin access)
 * - If kindeUserId is provided: Returns calendar only if assigned to that user
 */
export async function getCalendarById(
  id: number,
  includePictures = false,
  kindeUserId?: string
): Promise<Calendar & { pictures?: Picture[] } | null> {
  const calendar = await prisma.calendar.findUnique({
    where: { id },
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
 * Get the current year's calendar with optional user filtering
 * Only returns the calendar for the current year (not past years)
 * Excludes fake calendars
 * - If kindeUserId is undefined: Returns calendar regardless of assignment (admin access)
 * - If kindeUserId is provided: Returns calendar only if assigned to that user
 */
export async function getLatestCalendar(
  includePictures = false,
  kindeUserId?: string
): Promise<Calendar & { pictures?: Picture[] } | null> {
  const currentYear = new Date().getFullYear()

  return prisma.calendar.findFirst({
    where: {
      year: currentYear,
      isPublished: true,
      isFake: false, // Exclude fake calendars
      // If kindeUserId provided, only get calendars assigned to that user
      ...(kindeUserId !== undefined && { kindeUserId: kindeUserId })
    },
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
  id: number,
  data: Partial<Omit<Calendar, 'id' | 'year' | 'createdAt' | 'updatedAt'>>
): Promise<Calendar> {
  return prisma.calendar.update({
    where: { id },
    data
  })
}

/**
 * Delete a calendar by ID
 * Pictures will be cascade deleted
 */
export async function deleteCalendar(id: number): Promise<void> {
  await prisma.calendar.delete({
    where: { id }
  })
}
