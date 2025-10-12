import { NextRequest, NextResponse } from "next/server"
import { getCalendarByYear } from "@api/lib/dal"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"

/**
 * GET /api/calendars/[year]
 * Returns a specific calendar by year with its pictures
 * - Admins: Can access any calendar
 * - Regular users: Can only access calendars assigned to them
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        const { year: yearParam } = await params

        if (!yearParam) {
            return NextResponse.json(
                { error: "Year parameter is required" },
                { status: 400 }
            )
        }

        const year = parseInt(yearParam)

        if (isNaN(year)) {
            return NextResponse.json(
                { error: "Invalid year parameter" },
                { status: 400 }
            )
        }

        // Admins can access any calendar, regular users only their assigned calendars
        const calendar = await getCalendarByYear(
            year,
            true,
            isAdmin ? undefined : kindeUser.id
        )

        if (!calendar) {
            return NextResponse.json(
                { error: `Calendar not found for year ${year}` },
                { status: 404 }
            )
        }

        return NextResponse.json(calendar)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
