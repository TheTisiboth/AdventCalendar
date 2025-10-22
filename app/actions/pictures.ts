"use server"

import { revalidatePath } from "next/cache"
import { getAllPictures, updatePictureOpenStatus } from "@api/lib/dal/pictures"
import { getAllDummyPictures } from "@api/lib/dal/dummyPictures"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import { getCalendarByYear } from "@api/lib/dal/calendars"
import { getSignedUrl } from "@api/lib/s3"
import type { Picture, DummyPicture } from "@prisma/client"

export type PictureWithUrl = Picture & { url: string }
export type DummyPictureWithUrl = DummyPicture & { url: string }

/**
 * Get all pictures for a given year with signed URLs
 * Requires authentication
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

/**
 * Get all dummy pictures for the test page
 * These are fake pictures used for demo/testing purposes only
 * No authentication required as this is for public test page
 */
export async function getDummyPictures(): Promise<DummyPictureWithUrl[]> {
    const dummyPictures = await getAllDummyPictures()

    // Dummy pictures already have URLs in their 'key' field (picsum URLs)
    // So we just map them to include a 'url' property
    const dummyPicturesWithUrls = dummyPictures.map((picture) => ({
        ...picture,
        url: picture.key // For dummy pictures, the key IS the URL
    }))

    return dummyPicturesWithUrls
}

/**
 * Open a dummy picture for a specific day
 * Used in fake/test mode only
 * No authentication required
 */
export async function openDummyPicture(day: number): Promise<DummyPicture> {
    try {
        const { updateDummyPictureOpenStatus } = await import("@api/lib/dal/dummyPictures")

        const picture = await updateDummyPictureOpenStatus(day, true)

        if (!picture) {
            throw new Error("Dummy picture not found")
        }

        // Revalidate the test page to show updated state
        revalidatePath(`/test`)

        return picture
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to open dummy picture")
    }
}
