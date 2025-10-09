import { NextRequest, NextResponse } from "next/server"
import { getAllPictures } from "@api/lib/dal"
import { checkAuth } from "@api/lib/auth"

export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)

        const searchParams = request.nextUrl.searchParams
        const yearParam = searchParams.get("year")

        if (!yearParam) {
            return NextResponse.json({ error: "Year parameter is required" }, { status: 400 })
        }

        const year = parseInt(yearParam)
        const pictures = await getAllPictures(year)

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
