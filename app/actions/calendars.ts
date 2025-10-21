"use server"

import { getAllCalendars, getCalendarByYear, getLatestCalendar } from "@api/lib/dal/calendars"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import type { Calendar, Picture } from "@prisma/client"

/**
 * Get all calendars (with optional filters)
 * Requires authentication. Admins see all calendars, users see only their assigned calendars.
 */
export async function getCalendars(options?: {
    archived?: boolean
    isPublished?: boolean
}): Promise<Calendar[]> {
    try {
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        const calendars = await getAllCalendars({
            ...options,
            // Non-admins can only see their assigned calendars
            kindeUserId: isAdmin ? undefined : kindeUser.id
        })

        return calendars
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch calendars")
    }
}

/**
 * Get a specific calendar by year
 * Requires authentication and checks access permissions
 */
export async function getCalendar(
    year: number,
    includePictures = false
): Promise<(Calendar & { pictures?: Picture[] }) | null> {
    try {
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        const calendar = await getCalendarByYear(
            year,
            includePictures,
            isAdmin ? undefined : kindeUser.id
        )

        return calendar
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch calendar")
    }
}

/**
 * Get the current year's calendar
 * Requires authentication and checks access permissions
 */
export async function getCurrentCalendar(
    includePictures = false
): Promise<(Calendar & { pictures?: Picture[] }) | null> {
    try {
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        const calendar = await getLatestCalendar(
            includePictures,
            isAdmin ? undefined : kindeUser.id
        )

        return calendar
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch current calendar")
    }
}
