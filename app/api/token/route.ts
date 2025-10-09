import { NextRequest, NextResponse } from "next/server"
import { findRefreshToken } from "@api/lib/dal"
import { generateAccessToken, verifyRefreshToken } from "@api/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { refreshToken } = body

        if (!refreshToken) {
            return NextResponse.json({ error: "Refresh token is required" }, { status: 401 })
        }

        const tokenExists = await findRefreshToken(refreshToken)

        if (!tokenExists) {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 })
        }

        try {
            const user = await verifyRefreshToken(refreshToken)
            const accessToken = generateAccessToken(user)
            return NextResponse.json({ accessToken })
        } catch (err) {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 })
        }
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
