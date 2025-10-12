import { NextRequest, NextResponse } from "next/server"
import { getAllCalendars } from "@api/lib/dal"
import { requireKindeAuth } from "@api/lib/kindeAuth"

/**
 * GET /api/calendars
 * Returns all calendars for the authenticated user, optionally filtered by archived/published status
 * Query params:
 * - archived: true/false (optional)
 * - published: true/false (optional)
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated Kinde user
        const kindeUser = await requireKindeAuth()

        const searchParams = request.nextUrl.searchParams
        const archivedParam = searchParams.get("archived")
        const publishedParam = searchParams.get("published")

        const options: {
            isArchived?: boolean
            isPublished?: boolean
            kindeUserId?: string | null
        } = {
            // Filter by user - include calendars assigned to this user OR unassigned (null)
            kindeUserId: kindeUser.id
        }

        if (archivedParam !== null) {
            options.isArchived = archivedParam === "true"
        }

        if (publishedParam !== null) {
            options.isPublished = publishedParam === "true"
        }

        // Get calendars for the user or unassigned calendars
        const allCalendars = await getAllCalendars(options)
        const unassignedCalendars = await getAllCalendars({
            ...options,
            kindeUserId: null
        })

        // Combine and deduplicate calendars
        const calendarsMap = new Map()
        ;[...allCalendars, ...unassignedCalendars].forEach(cal => {
            calendarsMap.set(cal.id, cal)
        })

        const calendars = Array.from(calendarsMap.values()).sort((a, b) => b.year - a.year)

        return NextResponse.json(calendars)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 401 })
    }
}
