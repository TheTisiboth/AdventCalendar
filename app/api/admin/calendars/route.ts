import { NextRequest, NextResponse } from "next/server"
import { checkAdminAuth } from "@api/lib/auth"
import { prisma } from "@api/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        console.log("Admin calendars API: Checking auth...")
        await checkAdminAuth(request)
        console.log("Admin calendars API: Auth passed")

        console.log("Admin calendars API: Fetching calendars...")
        const calendars = await prisma.calendar.findMany({
            include: {
                _count: {
                    select: { pictures: true }
                }
            },
            orderBy: { year: "desc" }
        })
        console.log("Admin calendars API: Found", calendars.length, "calendars")

        const calendarsWithCount = calendars.map((calendar) => ({
            id: calendar.id,
            year: calendar.year,
            title: calendar.title,
            description: calendar.description,
            isArchived: calendar.isArchived,
            isPublished: calendar.isPublished,
            pictureCount: calendar._count.pictures
        }))

        return NextResponse.json(calendarsWithCount)
    } catch (error) {
        console.error("Admin calendars API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unauthorized" },
            { status: 401 }
        )
    }
}
