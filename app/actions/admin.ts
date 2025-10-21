"use server"

import { revalidatePath } from "next/cache"
import { createCalendar, updateCalendar } from "@api/lib/dal/calendars"
import { createPictures } from "@api/lib/dal/pictures"
import { requireKindeAdmin } from "@api/lib/kindeAuth"
import type { Calendar, Picture } from "@prisma/client"
import { uploadToS3 } from "@api/lib/s3"

type KindeUser = {
    id: string
    email: string
    fullName: string
}

/**
 * Get all Kinde users (for admin user assignment)
 * Requires admin permission
 */
export async function getKindeUsers(): Promise<KindeUser[]> {
    try {
        await requireKindeAdmin()

        const kindeIssuerUrl = process.env.KINDE_ISSUER_URL!
        const clientId = process.env.KINDE_M2M_CLIENT_ID
        const clientSecret = process.env.KINDE_M2M_CLIENT_SECRET

        if (!kindeIssuerUrl || !clientId || !clientSecret) {
            throw new Error("Kinde configuration missing")
        }

        // Get access token for Management API
        const tokenResponse = await fetch(`${kindeIssuerUrl}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
                audience: `${kindeIssuerUrl}/api`
            })
        })

        if (!tokenResponse.ok) {
            throw new Error(`Failed to get Kinde API access token: ${tokenResponse.status}`)
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        if (!accessToken) {
            throw new Error("No access token received from Kinde")
        }

        // Fetch users from Kinde Management API
        const usersResponse = await fetch(`${kindeIssuerUrl}/api/v1/users`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json"
            }
        })

        if (!usersResponse.ok) {
            throw new Error(
                `Failed to fetch users from Kinde: ${usersResponse.status}. Check M2M permissions in Kinde dashboard.`
            )
        }

        const usersData = await usersResponse.json()
        const usersList = Array.isArray(usersData) ? usersData : usersData.users || []

        const users = usersList.map((user: { id: string; email: string; first_name?: string; last_name?: string }) => ({
            id: user.id,
            email: user.email,
            fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
        }))

        return users
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch users")
    }
}

/**
 * Get all calendars (admin only)
 * Includes unpublished and all user-assigned calendars with picture counts
 */
export async function adminGetAllCalendars(options?: {
    archived?: boolean
    isPublished?: boolean
}): Promise<Array<Calendar & { pictureCount: number }>> {
    try {
        await requireKindeAdmin()

        const { prisma } = await import("@api/lib/prisma")

        const currentYear = new Date().getFullYear()

        const calendars = await prisma.calendar.findMany({
            where: {
                ...(options?.archived === true && { year: { lt: currentYear } }),
                ...(options?.archived === false && { year: currentYear }),
                ...(options?.isPublished !== undefined && { isPublished: options.isPublished })
            },
            include: {
                _count: {
                    select: { pictures: true }
                }
            },
            orderBy: { year: 'desc' }
        })

        return calendars.map((cal) => ({
            ...cal,
            pictureCount: cal._count.pictures
        }))
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch calendars")
    }
}

/**
 * Create a new calendar with pictures (admin only)
 */
export async function adminCreateCalendar(data: {
    year: number
    title: string
    description?: string
    kindeUserId?: string | null
    isPublished: boolean
    pictures: Array<{
        day: number
        file: File
    }>
}): Promise<Calendar> {
    try {
        await requireKindeAdmin()

        // Create the calendar
        const calendar = await createCalendar({
            year: data.year,
            title: data.title,
            description: data.description ?? null,
            kindeUserId: data.kindeUserId ?? null,
            isPublished: data.isPublished,
            coverImage: null
        })

        // Upload pictures to S3 and create picture records
        const picturePromises = data.pictures.map(async (pic) => {
            const arrayBuffer = await pic.file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const key = await uploadToS3(buffer, `${data.year}/${pic.day}.jpg`, pic.file.type)

            return {
                day: pic.day,
                year: data.year,
                key,
                isOpen: false,
                isOpenable: true,
                date: new Date(data.year, 11, pic.day) // December is month 11
            }
        })

        const pictureData = await Promise.all(picturePromises)
        await createPictures(pictureData)

        // Revalidate admin pages
        revalidatePath("/admin/manage")
        revalidatePath(`/admin/manage/edit/${data.year}`)
        revalidatePath(`/calendar`)
        revalidatePath(`/archive`)
        revalidatePath(`/archive/${data.year}`)

        return calendar
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create calendar")
    }
}

/**
 * Update an existing calendar (admin only)
 */
export async function adminUpdateCalendar(
    year: number,
    data: {
        title?: string
        description?: string
        kindeUserId?: string | null
        isPublished?: boolean
    }
): Promise<Calendar> {
    try {
        await requireKindeAdmin()

        const calendar = await updateCalendar(year, data)

        // Revalidate relevant pages
        revalidatePath("/admin/manage")
        revalidatePath(`/admin/manage/edit/${year}`)
        if (data.isPublished !== undefined) {
            revalidatePath("/calendar")
            revalidatePath("/archive")
        }

        return calendar
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update calendar")
    }
}

/**
 * Delete a calendar and all its pictures (admin only)
 */
export async function adminDeleteCalendar(year: number): Promise<void> {
    try {
        await requireKindeAdmin()

        const { prisma } = await import("@api/lib/prisma")

        // Delete pictures first (foreign key constraint)
        await prisma.picture.deleteMany({
            where: { year }
        })

        // Delete calendar
        await prisma.calendar.delete({
            where: { year }
        })

        // Revalidate relevant pages
        revalidatePath("/admin/manage")
        revalidatePath(`/calendar`)
        revalidatePath(`/archive`)
        revalidatePath(`/archive/${year}`)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to delete calendar")
    }
}

/**
 * Upload a new picture for a calendar (admin only)
 */
export async function adminUploadPicture(data: {
    year: number
    day: number
    file: File
}): Promise<void> {
    try {
        await requireKindeAdmin()

        const arrayBuffer = await data.file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const key = await uploadToS3(buffer, `${data.year}/${data.day}.jpg`, data.file.type)

        await createPictures([
            {
                day: data.day,
                year: data.year,
                key,
                isOpen: false,
                isOpenable: true,
                date: new Date(data.year, 11, data.day)
            }
        ])

        // Revalidate relevant pages
        revalidatePath(`/admin/manage/edit/${data.year}`)
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${data.year}`)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to upload picture")
    }
}

/**
 * Upload multiple pictures for a calendar (admin only)
 */
export async function adminUploadPictures(data: {
    year: number
    pictures: Array<{ day: number; file: File }>
}): Promise<void> {
    try {
        await requireKindeAdmin()

        // Upload all pictures to S3 and create database records
        const picturePromises = data.pictures.map(async (pic) => {
            const arrayBuffer = await pic.file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const key = await uploadToS3(buffer, `${data.year}/${pic.day}.jpg`, pic.file.type)

            return {
                day: pic.day,
                year: data.year,
                key,
                isOpen: false,
                isOpenable: true,
                date: new Date(data.year, 11, pic.day)
            }
        })

        const pictureData = await Promise.all(picturePromises)
        await createPictures(pictureData)

        // Revalidate relevant pages
        revalidatePath(`/admin/manage/edit/${data.year}`)
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${data.year}`)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to upload pictures")
    }
}

/**
 * Get a calendar with pictures (admin only)
 */
export async function adminGetCalendar(year: number): Promise<
    | (Calendar & {
          pictures: Array<Picture & { url: string }>
      })
    | null
> {
    try {
        await requireKindeAdmin()

        const { prisma } = await import("@api/lib/prisma")

        const calendar = await prisma.calendar.findUnique({
            where: { year },
            include: {
                pictures: {
                    orderBy: { day: "asc" }
                }
            }
        })

        if (!calendar) return null

        // Add signed URLs to pictures
        const { getSignedUrl } = await import("@api/lib/s3")
        const picturesWithUrls = calendar.pictures.map((picture) => ({
            ...picture,
            url: getSignedUrl(picture.key)
        }))

        return {
            ...calendar,
            pictures: picturesWithUrls
        }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch calendar")
    }
}

/**
 * Delete a picture from a calendar (admin only)
 */
export async function adminDeletePicture(pictureId: number): Promise<void> {
    try {
        await requireKindeAdmin()

        const { prisma } = await import("@api/lib/prisma")
        const { deleteFromS3 } = await import("@api/lib/s3")

        // Get the picture to find its S3 key
        const picture = await prisma.picture.findUnique({
            where: { id: pictureId }
        })

        if (!picture) {
            throw new Error("Picture not found")
        }

        // Delete from S3
        await deleteFromS3(picture.key)

        // Delete from database
        await prisma.picture.delete({
            where: { id: pictureId }
        })

        // Revalidate relevant pages
        revalidatePath(`/admin/manage/edit/${picture.year}`)
        revalidatePath(`/calendar`)
        revalidatePath(`/archive/${picture.year}`)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to delete picture")
    }
}
