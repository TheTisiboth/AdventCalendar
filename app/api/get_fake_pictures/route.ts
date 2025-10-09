import { NextRequest, NextResponse } from "next/server"
import { getAllDummyPictures } from "../lib/dal"

export async function GET(request: NextRequest) {
    try {
        const pictures = await getAllDummyPictures()

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
