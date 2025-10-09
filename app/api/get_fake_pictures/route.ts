import { NextResponse } from "next/server"
import { getAllDummyPictures } from "@api/lib/dal"

export async function GET() {
    try {
        // Year parameter is accepted for consistency but not used
        // Dummy pictures always return all records
        const pictures = await getAllDummyPictures()

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
