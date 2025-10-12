import { NextRequest, NextResponse } from "next/server"
import { updatePictureOpenStatus } from "@api/lib/dal"
import { requireKindeAuth } from "@api/lib/kindeAuth"

export async function GET(request: NextRequest) {
    try {
        const kindeUser = await requireKindeAuth()

        const searchParams = request.nextUrl.searchParams
        const day = searchParams.get("day")
        const year = searchParams.get("year")

        if (!day) {
            return NextResponse.json({ error: "Day parameter is required" }, { status: 400 })
        }

        if (!year) {
            return NextResponse.json({ error: "Year parameter is required" }, { status: 400 })
        }

        const picture = await updatePictureOpenStatus(parseInt(day), parseInt(year), true)

        if (!picture) {
            return NextResponse.json({ error: "Picture not found" }, { status: 404 })
        }

        return NextResponse.json(picture)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
