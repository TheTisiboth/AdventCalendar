import { NextRequest, NextResponse } from "next/server"
import { pictureModel } from "../lib/models"
import { checkAuth } from "../lib/auth"
import { Picture } from "@/types/types"
import connectDB from "../lib/mongodb"

export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)
        await connectDB()
        const pictures = (await pictureModel.find()).map((pic) => pic.toObject() as Picture)

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
