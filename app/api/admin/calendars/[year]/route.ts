import { NextRequest, NextResponse } from "next/server"
import { requireKindeAdmin } from "@api/lib/kindeAuth"
import { prisma } from "@api/lib/prisma"
import { deleteMultipleFromS3 } from "@api/lib/s3"

const CDN_URL = process.env.CDN_URL!

function getImageUrl(key: string): string {
    return CDN_URL + key
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        await requireKindeAdmin()

        const { year: yearParam } = await params
        const year = Number(yearParam)

        const calendar = await prisma.calendar.findUnique({
            where: { year },
            include: {
                pictures: {
                    orderBy: { day: "asc" }
                }
            }
        })

        if (!calendar) {
            return NextResponse.json(
                { error: "Calendar not found" },
                { status: 404 }
            )
        }

        // Add CDN URLs to pictures
        const picturesWithUrls = calendar.pictures.map((picture) => ({
            id: picture.id,
            day: picture.day,
            key: picture.key,
            url: getImageUrl(picture.key)
        }))

        return NextResponse.json({
            id: calendar.id,
            year: calendar.year,
            title: calendar.title,
            description: calendar.description,
            isPublished: calendar.isPublished,
            kindeUserId: calendar.kindeUserId,
            pictures: picturesWithUrls
        })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unauthorized" },
            { status: 401 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        await requireKindeAdmin()

        const { year: yearParam } = await params
        const year = Number(yearParam)
        const body = await request.json()

        const { title, description, isPublished, kindeUserId } = body

        // Check if calendar exists
        const existingCalendar = await prisma.calendar.findUnique({
            where: { year },
            include: {
                _count: {
                    select: { pictures: true }
                }
            }
        })

        if (!existingCalendar) {
            return NextResponse.json(
                { error: "Calendar not found" },
                { status: 404 }
            )
        }

        // If trying to publish, must have exactly 24 pictures
        if (isPublished && existingCalendar._count.pictures !== 24) {
            return NextResponse.json(
                { error: `Cannot publish calendar with ${existingCalendar._count.pictures} pictures. Exactly 24 pictures are required.` },
                { status: 400 }
            )
        }

        // Update calendar
        const updatedCalendar = await prisma.calendar.update({
            where: { year },
            data: {
                title,
                description: description || null,
                isPublished,
                ...(kindeUserId !== undefined && { kindeUserId: kindeUserId || null })
            }
        })

        return NextResponse.json({ success: true, calendar: updatedCalendar })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update calendar" },
            { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        await requireKindeAdmin()

        const { year: yearParam } = await params
        const year = Number(yearParam)

        // Get calendar with all pictures to delete from S3
        const calendar = await prisma.calendar.findUnique({
            where: { year },
            include: {
                pictures: true
            }
        })

        if (!calendar) {
            return NextResponse.json(
                { error: "Calendar not found" },
                { status: 404 }
            )
        }

        // Delete all pictures from S3
        const pictureKeys = calendar.pictures.map((picture) => picture.key)
        if (pictureKeys.length > 0) {
            await deleteMultipleFromS3(pictureKeys)
        }

        // Delete pictures from database first
        await prisma.picture.deleteMany({
            where: { year }
        })

        // Then delete calendar from database
        await prisma.calendar.delete({
            where: { year }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete calendar" },
            { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
        )
    }
}
