"use server"

import { revalidatePath } from "next/cache"
import { getAllPictures, updatePictureOpenStatus } from "@api/lib/dal/pictures"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import { getCalendarByYear } from "@api/lib/dal/calendars"
import { getSignedUrl } from "@api/lib/s3"
import type { Picture } from "@prisma/client"
import { shuffle } from "@/utils/utils"

export type PictureWithUrl = Picture & { url: string }

/**
 * Generate fake pictures for testing/demo purposes
 * Does NOT require authentication - used for public test page
 */
export async function getFakePictures(year: number): Promise<PictureWithUrl[]> {
    // Generate 24 fake pictures (Dec 1-24)
    const pictures: PictureWithUrl[] = []

    for (let day = 1; day <= 24; day++) {
        pictures.push({
            id: day,
            day,
            year,
            key: `fake/${year}/${day}`,
            url: `https://picsum.photos/400/400?sig${day}`,  // Random image from Lorem Picsum
            isOpen: false,
            isOpenable: true,
            date: new Date(year, 11, day), // December is month 11
        })
    }

    // Shuffle pictures with a consistent seed so they appear in random order
    return shuffle(pictures, year)
}

/**
 * Get all pictures for a given year with signed URLs
 * Requires authentication and checks calendar access permissions
 */
export async function getPictures(year: number): Promise<PictureWithUrl[]> {
    try {
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        // Check if user has access to this calendar
        const calendar = await getCalendarByYear(year, false, isAdmin ? undefined : kindeUser.id)

        if (!calendar) {
            throw new Error("Calendar not found or access denied")
        }

        const pictures = await getAllPictures(year)

        // Generate signed URLs for all pictures
        const picturesWithUrls = pictures.map((picture) => ({
            ...picture,
            url: getSignedUrl(picture.key)
        }))

        return picturesWithUrls
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch pictures")
    }
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
