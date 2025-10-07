import { NextRequest, NextResponse } from "next/server"
import { dummyPictureModel } from "../lib/models"
import { Picture } from "@/types/types"
import connectDB from "../lib/mongodb"

export async function GET(request: NextRequest) {
    try {
        await connectDB()
        const pictures = (await dummyPictureModel.find()).map((pic) => pic.toObject() as Picture)

        return NextResponse.json(pictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
