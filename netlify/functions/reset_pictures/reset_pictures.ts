import { Handler } from "@netlify/functions"
import { connect, disconnect } from "mongoose"
import { Picture } from "../../../src/types/types"
import { dummyPictureModel } from "../../models/models"

export const handler: Handler = async (_event, _context) => {
    try {
        await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
        await dummyPictureModel.collection.drop()

        const dummyPictures = [...Array(24)].map((_, i) => {
            const date = new Date()
            date.setUTCHours(0, 0, 0, 0)
            date.setUTCMonth(11)
            date.setUTCDate(i + 1)
            return {
                day: i + 1,
                isOpen: false,
                isOpenable: false,
                key: "https://picsum.photos/200/300?sig=" + i + 1,
                date: date
            } as Picture
        })

        await dummyPictureModel.insertMany(dummyPictures)

        return {
            statusCode: 200,
            body: JSON.stringify(dummyPictures)
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    } finally {
        await disconnect()
    }
}
