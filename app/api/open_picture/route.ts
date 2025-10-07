import { NextRequest, NextResponse } from "next/server"
import { pictureModel } from "../lib/models"
import { checkAuth } from "../lib/auth"
import connectDB from "../lib/mongodb"

export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)

        const searchParams = request.nextUrl.searchParams
        const day = searchParams.get("day")

        if (!day) {
            return NextResponse.json({ error: "Day parameter is required" }, { status: 400 })
        }

        await connectDB()
        const picture = await pictureModel.findOneAndUpdate(
            { day: parseInt(day) },
            { isOpen: true },
            { new: true }
        )

        if (!picture) {
            return NextResponse.json({ error: "Picture not found" }, { status: 404 })
        }

        return NextResponse.json(picture.toObject())
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
