import { NextResponse } from "next/server"
import { getAllDummyPictures } from "@api/lib/dal"

export async function GET() {
    try {
        const pictures = await getAllDummyPictures()

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
