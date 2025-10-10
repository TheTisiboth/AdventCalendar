import { NextRequest, NextResponse } from "next/server"
import { getCalendarByYear, getLatestCalendar } from "@api/lib/dal"
import { checkAuth } from "@api/lib/auth"
import { getCurrentCalendarYear, isInAdventPeriod } from "@/utils/utils"

/**
 * GET /api/calendars/current
 * Returns the current calendar to display:
 * - If in Advent period (Dec 1-24): returns current year's calendar
 * - Otherwise: returns the most recent calendar
 */
export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)

        const inAdventPeriod = isInAdventPeriod()
        const currentYear = getCurrentCalendarYear()

        // Try to get the calendar for the determined year
        let calendar = await getCalendarByYear(currentYear, true)

        // If no calendar exists for this year, fall back to latest
        if (!calendar) {
            calendar = await getLatestCalendar(true)
        }

        if (!calendar) {
            return NextResponse.json(
                { error: "No calendar found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            calendar,
            isLive: inAdventPeriod,
            year: calendar.year
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
