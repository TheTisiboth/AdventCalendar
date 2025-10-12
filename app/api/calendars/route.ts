import { NextRequest, NextResponse } from "next/server"
import { getAllCalendars } from "@api/lib/dal"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"

/**
 * GET /api/calendars
 * Returns calendars based on user role:
 * - Admins: All calendars
 * - Regular users: Only calendars assigned to them
 * Query params:
 * - archived: true/false (optional)
 * - published: true/false (optional)
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated Kinde user
        const kindeUser = await requireKindeAuth()

        // Check if user is admin
        const isAdmin = await isKindeAdmin()

        const searchParams = request.nextUrl.searchParams
        const archivedParam = searchParams.get("archived")
        const publishedParam = searchParams.get("published")

        const options: {
            isArchived?: boolean
            isPublished?: boolean
            kindeUserId?: string | null
        } = {}

        // Admins see all calendars, regular users only see calendars assigned to them
        if (!isAdmin) {
            options.kindeUserId = kindeUser.id
        }

        if (archivedParam !== null) {
            options.isArchived = archivedParam === "true"
        }

        if (publishedParam !== null) {
            options.isPublished = publishedParam === "true"
        }

        // Get calendars based on user role
        const calendars = await getAllCalendars(options)

        // Sort by year descending
        calendars.sort((a, b) => b.year - a.year)

        return NextResponse.json(calendars)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 401 })
    }
}
