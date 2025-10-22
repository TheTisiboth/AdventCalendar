"use server"

import { revalidatePath } from "next/cache"
import { getAllPictures, updatePictureOpenStatus } from "@api/lib/dal/pictures"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import { getCalendarByYear } from "@api/lib/dal/calendars"
import { getSignedUrl } from "@api/lib/s3"
import type { Picture } from "@prisma/client"

export type PictureWithUrl = Picture & { url: string }

/**
 * Get all pictures for a given year with signed URLs
 * @param year - Calendar year
 * @param requireAuth - Whether authentication is required (default: true)
 *                      Set to false for public calendars (e.g., test page)
 */
export async function getPictures(year: number, requireAuth: boolean = true): Promise<PictureWithUrl[]> {
    let calendar

    if (requireAuth) {
        // Authenticated access - check user permissions
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        calendar = await getCalendarByYear(year, false, isAdmin ? undefined : kindeUser.id)

        if (!calendar) {
            throw new Error("Calendar not found or access denied")
        }
    } else {
        // Public access - only allow published calendars
        calendar = await getCalendarByYear(year, false, undefined)

        if (!calendar || !calendar.isPublished) {
            throw new Error("Calendar not found or not published")
        }
    }

    const pictures = await getAllPictures(year)

    // Generate signed URLs for all pictures
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
