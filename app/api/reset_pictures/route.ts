import { NextResponse } from "next/server"
import { dummyPictureModel } from "../lib/models"
import { Picture } from "@/types/types"
import connectDB from "../lib/mongodb"

export async function GET() {
    try {
        await connectDB()
        await dummyPictureModel.collection.drop().catch(() => {
            // Collection might not exist, ignore error
        })

        const dummyPictures = [...Array(24)].map((_, i) => {
            const date = new Date()
            date.setUTCHours(0, 0, 0, 0)
            date.setUTCMonth(11)
            date.setUTCDate(i + 1)
            return {
                day: i + 1,
                isOpen: false,
                isOpenable: false,
                key: "https://picsum.photos/200/300?sig=" + (i + 1),
                date: date
            } as Picture
        })

        await dummyPictureModel.insertMany(dummyPictures)

        return NextResponse.json(dummyPictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
