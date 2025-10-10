import { NextRequest, NextResponse } from "next/server"
import { getCalendarByYear } from "@api/lib/dal"
import { checkAuth } from "@api/lib/auth"

/**
 * GET /api/calendars/[year]
 * Returns a specific calendar by year with its pictures
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        await checkAuth(request)

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

        const calendar = await getCalendarByYear(year, true)

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
