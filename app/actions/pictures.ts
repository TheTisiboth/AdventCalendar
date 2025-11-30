"use server"

import { revalidatePath } from "next/cache"
import { getAllPicturesByCalendarId, updatePictureOpenStatus, getTestCalendar } from "@api/lib/dal/pictures"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import { getCalendarById } from "@api/lib/dal/calendars"
import { getSignedUrl } from "@api/lib/s3"
import type { Picture } from "@prisma/client"

export type PictureWithUrl = Picture & { url: string }

/**
 * Get all pictures for a calendar by ID with signed URLs
 * Requires authentication
 * Excludes fake calendars (use getTestPictures for those)
 * @param calendarId - Calendar ID
 */
export async function getPicturesByCalendarId(calendarId: number): Promise<PictureWithUrl[]> {
    // Authenticated access - check user permissions
    const kindeUser = await requireKindeAuth()
    const isAdmin = await isKindeAdmin()

    const calendar = await getCalendarById(calendarId, false, isAdmin ? undefined : kindeUser.id)

    if (!calendar) {
        throw new Error("Calendar not found or access denied")
    }

    // Prevent access to fake calendars through this endpoint
    if (calendar.isFake) {
        throw new Error("Use test endpoint for fake calendars")
    }

    const pictures = await getAllPicturesByCalendarId(calendarId)

    // Generate signed URLs for real calendars (S3 keys)
    const picturesWithUrls = pictures.map((picture) => ({
        ...picture,
        url: getSignedUrl(picture.key)
    }))

    return picturesWithUrls
}


/**
 * Open a picture for a specific day and calendar ID
 * Requires authentication
 */
export async function openPicture(day: number, calendarId: number): Promise<Picture> {
    try {
        await requireKindeAuth()

        const picture = await updatePictureOpenStatus(day, calendarId, true)

        if (!picture) {
            throw new Error("Picture not found")
        }

        // Revalidate the calendar page to show updated state
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${calendarId}`)

        return picture
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to open picture")
    }
}

/**
 * Reset all pictures for a given calendar (set isOpen to false)
 * This is typically used for testing/demo purposes
 */
export async function resetPictures(calendarId: number): Promise<void> {
    try {
        await requireKindeAuth()

        const pictures = await getAllPicturesByCalendarId(calendarId)

        // Update all pictures to closed
        await Promise.all(
            pictures.map((pic) => updatePictureOpenStatus(pic.day, pic.calendarId, false))
        )

        // Revalidate relevant pages
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${calendarId}`)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to reset pictures")
    }
}

/**
 * Get all pictures for the test page (fake calendar)
 * No authentication required as this is for public test page
 * Returns pictures and calendar year
 */
export async function getTestPictures(): Promise<{ pictures: PictureWithUrl[], year: number }> {
    const calendar = await getTestCalendar()

    if (!calendar || !calendar.isPublished || !calendar.isFake) {
        throw new Error("Test calendar not found or not published")
    }

    const pictures = await getAllPicturesByCalendarId(calendar.id)

    // For fake calendars, the key IS the full URL (no need for S3 signing)
    const picturesWithUrls = pictures.map((picture) => ({
        ...picture,
        url: picture.key
    }))

    return { pictures: picturesWithUrls, year: calendar.year }
}

/**
 * Open a picture in the test calendar
 * No authentication required
 */
export async function openTestPicture(day: number): Promise<Picture> {
    try {
        const calendar = await getTestCalendar()

        if (!calendar) {
            throw new Error("Test calendar not found")
        }

        const picture = await updatePictureOpenStatus(day, calendar.id, true)

        if (!picture) {
            throw new Error("Test picture not found")
        }

        // Revalidate the test page to show updated state
        revalidatePath(`/test`)

        return picture
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to open test picture")
    }
}
