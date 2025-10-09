import { NextRequest, NextResponse } from "next/server"
import { updateDummyPictureOpenStatus } from "@api/lib/dal"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const day = searchParams.get("day")

        if (!day) {
            return NextResponse.json({ error: "Day parameter is required" }, { status: 400 })
        }

        const picture = await updateDummyPictureOpenStatus(parseInt(day), true)

        if (!picture) {
            return NextResponse.json({ error: "Picture not found" }, { status: 404 })
        }

        return NextResponse.json(picture)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
