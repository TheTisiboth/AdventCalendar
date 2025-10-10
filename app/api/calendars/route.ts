import { NextRequest, NextResponse } from "next/server"
import { getAllCalendars } from "@api/lib/dal"
import { checkAuth } from "@api/lib/auth"

/**
 * GET /api/calendars
 * Returns all calendars, optionally filtered by archived/published status
 * Query params:
 * - archived: true/false (optional)
 * - published: true/false (optional)
 */
export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)

        const searchParams = request.nextUrl.searchParams
        const archivedParam = searchParams.get("archived")
        const publishedParam = searchParams.get("published")

        const options: {
            isArchived?: boolean
            isPublished?: boolean
        } = {}

        if (archivedParam !== null) {
            options.isArchived = archivedParam === "true"
        }

        if (publishedParam !== null) {
            options.isPublished = publishedParam === "true"
        }

        const calendars = await getAllCalendars(options)

        return NextResponse.json(calendars)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
