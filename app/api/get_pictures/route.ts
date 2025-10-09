import { NextRequest, NextResponse } from "next/server"
import { getAllPictures } from "../lib/dal"
import { checkAuth } from "../lib/auth"

export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)
        const pictures = await getAllPictures()

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
