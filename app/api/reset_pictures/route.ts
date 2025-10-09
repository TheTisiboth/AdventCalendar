import { NextResponse } from "next/server"
import { deleteAllDummyPictures, createDummyPictures } from "@api/lib/dal"

export async function GET() {
    try {
        // Delete all dummy pictures
        await deleteAllDummyPictures()

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
            }
        })

        await createDummyPictures(dummyPictures)

        return NextResponse.json(dummyPictures)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
