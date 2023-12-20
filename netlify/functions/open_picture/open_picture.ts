import { Handler } from "@netlify/functions"
import { connect, disconnect } from "mongoose"
import { pictureModel } from "../../models/models"
import middy from "middy"
import { authMiddleware } from "../../utils/middleware"

export const func: Handler = async (event, _context) => {
    try {
        await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
        const day = event.queryStringParameters?.day
        const pic = await pictureModel.findOneAndUpdate({ day }, { isOpen: true }).exec()

        return {
            statusCode: 200,
            body: JSON.stringify(pic)
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    } finally {
        void disconnect()
    }
}

// Use authMiddleware to protect the route
export const handler = middy(func).use(authMiddleware())
