import { NextRequest, NextResponse } from "next/server"
import { requireKindeAdmin } from "@api/lib/kindeAuth"
import { prisma } from "@api/lib/prisma"

export async function GET(_request: NextRequest) {
    try {
        await requireKindeAdmin()

        const calendars = await prisma.calendar.findMany({
            include: {
                _count: {
                    select: { pictures: true }
                }
            },
            orderBy: { year: "desc" }
        })

        const calendarsWithCount = calendars.map((calendar) => ({
            id: calendar.id,
            year: calendar.year,
            title: calendar.title,
            description: calendar.description,
            isArchived: calendar.isArchived,
            isPublished: calendar.isPublished,
            kindeUserId: calendar.kindeUserId,
            pictureCount: calendar._count.pictures
        }))

        return NextResponse.json(calendarsWithCount)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unauthorized" },
            { status: 401 }
        )
    }
}
