import { NextRequest, NextResponse } from "next/server"
import { getCalendarByYear, getLatestCalendar } from "@api/lib/dal"
import { requireKindeAuth } from "@api/lib/kindeAuth"
import { getCurrentCalendarYear, isInAdventPeriod } from "@/utils/utils"

/**
 * GET /api/calendars/current
 * Returns the current calendar to display:
 * - If in Advent period (Dec 1-24): returns current year's calendar
 * - Otherwise: returns the most recent calendar
 * - Filters calendars by the authenticated user's Kinde ID
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated Kinde user
        const kindeUser = await requireKindeAuth()

        const inAdventPeriod = isInAdventPeriod()
        const currentYear = getCurrentCalendarYear()

        // Try to get the calendar for the determined year (filtered by user)
        let calendar = await getCalendarByYear(currentYear, true, kindeUser.id)

        // If no calendar exists for this year, fall back to latest (filtered by user)
        if (!calendar) {
            calendar = await getLatestCalendar(true, kindeUser.id)
        }

        if (!calendar) {
            return NextResponse.json(
                { error: "No calendar found for your account" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            calendar,
            isLive: inAdventPeriod,
            year: calendar.year
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 401 })
    }
}
