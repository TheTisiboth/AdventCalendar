"use server"

import { revalidatePath } from "next/cache"
import { getAllPictures, updatePictureOpenStatus } from "@api/lib/dal/pictures"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import { getCalendarByYear } from "@api/lib/dal/calendars"
import { getSignedUrl } from "@api/lib/s3"
import { TEST_YEAR } from "@/constants"
import type { Picture } from "@prisma/client"

export type PictureWithUrl = Picture & { url: string }

/**
 * Get all pictures for a given year with signed URLs
 * Requires authentication
 * Excludes fake calendars (use getTestPictures for those)
 * @param year - Calendar year
 */
export async function getPictures(year: number): Promise<PictureWithUrl[]> {
    // Authenticated access - check user permissions
    const kindeUser = await requireKindeAuth()
    const isAdmin = await isKindeAdmin()

    const calendar = await getCalendarByYear(year, false, isAdmin ? undefined : kindeUser.id)

    if (!calendar) {
        throw new Error("Calendar not found or access denied")
    }

    // Prevent access to fake calendars through this endpoint
    if (calendar.isFake) {
        throw new Error("Use test endpoint for fake calendars")
    }

    const pictures = await getAllPictures(year)

    // Generate signed URLs for real calendars (S3 keys)
    const picturesWithUrls = pictures.map((picture) => ({
        ...picture,
        url: getSignedUrl(picture.key)
    }))

    return picturesWithUrls
}

/**
 * Open a picture for a specific day and year
 * Requires authentication
 */
export async function openPicture(day: number, year: number): Promise<Picture> {
    try {
        await requireKindeAuth()

        const picture = await updatePictureOpenStatus(day, year, true)

        if (!picture) {
            throw new Error("Picture not found")
        }

        // Revalidate the calendar page to show updated state
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${year}`)

        return picture
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to open picture")
    }
}

/**
 * Reset all pictures for a given year (set isOpen to false)
 * This is typically used for testing/demo purposes
 */
export async function resetPictures(year: number): Promise<void> {
    try {
        await requireKindeAuth()

        const pictures = await getAllPictures(year)

        // Update all pictures to closed
        await Promise.all(
            pictures.map((pic) => updatePictureOpenStatus(pic.day, pic.year, false))
        )

        // Revalidate relevant pages
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${year}`)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to reset pictures")
    }
}

/**
 * Get all pictures for the test page (fake calendar)
 * No authentication required as this is for public test page
 * Returns pictures from the fake calendar (year 1996)
 */
export async function getTestPictures(): Promise<PictureWithUrl[]> {
    const calendar = await getCalendarByYear(TEST_YEAR, false, undefined)

    if (!calendar || !calendar.isPublished || !calendar.isFake) {
        throw new Error("Test calendar not found or not published")
    }

    const pictures = await getAllPictures(TEST_YEAR)

    // For fake calendars, the key IS the full URL (no need for S3 signing)
    const picturesWithUrls = pictures.map((picture) => ({
        ...picture,
        url: picture.key
    }))

    return picturesWithUrls
}

/**
 * Open a picture in the test calendar
 * No authentication required
 */
export async function openTestPicture(day: number): Promise<Picture> {
    try {
        const picture = await updatePictureOpenStatus(day, TEST_YEAR, true)

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
