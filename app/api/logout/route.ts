import { NextRequest, NextResponse } from "next/server"
import { refreshTokenModel } from "../lib/models"
import connectDB from "../lib/mongodb"

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { refreshToken } = body

        await connectDB()
        await refreshTokenModel.deleteOne({ token: refreshToken })

        return NextResponse.json({ message: "Logged out successfully" })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
