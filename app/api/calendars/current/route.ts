import { NextRequest, NextResponse } from "next/server"
import { getCalendarByYear, getLatestCalendar } from "@api/lib/dal"
import { requireKindeAuth, isKindeAdmin } from "@api/lib/kindeAuth"
import { getCurrentCalendarYear, isInAdventPeriod } from "@/utils/utils"

/**
 * GET /api/calendars/current
 * Returns the current calendar to display:
 * - If in Advent period (Dec 1-24): returns current year's calendar
 * - Otherwise: returns the most recent calendar
 * - Admins: Can access any calendar
 * - Regular users: Only calendars assigned to them
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated Kinde user
        const kindeUser = await requireKindeAuth()
        const isAdmin = await isKindeAdmin()

        const inAdventPeriod = isInAdventPeriod()
        const currentYear = getCurrentCalendarYear()

        // Admins see all calendars, regular users only their assigned calendars
        const userIdFilter = isAdmin ? undefined : kindeUser.id

        // Try to get the calendar for the determined year
        let calendar = await getCalendarByYear(currentYear, true, userIdFilter)

        // If no calendar exists for this year, fall back to latest
        if (!calendar) {
            calendar = await getLatestCalendar(true, userIdFilter)
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
