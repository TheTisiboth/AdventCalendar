import { Handler } from "@netlify/functions"
import { connect, disconnect } from "mongoose"
import { dummyPictureModel } from "../../models/models"

export const handler: Handler = async (event, _context) => {
    try {
        await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
        const day = event.queryStringParameters?.day
        const pic = await dummyPictureModel.findOneAndUpdate({ day }, { isOpen: true }).exec()

        return {
            statusCode: 200,
            body: JSON.stringify(pic)
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    } finally {
        await disconnect()
    }
}
