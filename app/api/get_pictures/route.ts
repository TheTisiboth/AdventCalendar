import { NextRequest, NextResponse } from "next/server"
import { getAllPictures } from "@api/lib/dal"
import { requireKindeAuth } from "@api/lib/kindeAuth"
import { getCalendarByYear } from "@api/lib/dal/calendars"

export async function GET(request: NextRequest) {
    try {
        // Get authenticated Kinde user
        const kindeUser = await requireKindeAuth()

        const searchParams = request.nextUrl.searchParams
        const yearParam = searchParams.get("year")

        if (!yearParam) {
            return NextResponse.json({ error: "Year parameter is required" }, { status: 400 })
        }

        const year = parseInt(yearParam)

        // Check if user has access to this calendar
        const calendar = await getCalendarByYear(year, false, kindeUser.id)

        if (!calendar) {
            return NextResponse.json(
                { error: "Calendar not found or access denied" },
                { status: 404 }
            )
        }

        const pictures = await getAllPictures(year)

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 401 })
    }
}
