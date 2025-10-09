import { NextRequest, NextResponse } from "next/server"
import { deleteRefreshToken } from "../lib/dal"

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { refreshToken } = body

        await deleteRefreshToken(refreshToken)

        return NextResponse.json({ message: "Logged out successfully" })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
