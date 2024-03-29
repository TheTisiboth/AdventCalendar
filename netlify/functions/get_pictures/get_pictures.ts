import { Handler } from "@netlify/functions"
import { connect, disconnect } from "mongoose"
import { pictureModel } from "../../models/models"
import { Picture } from "../../../src/types/types"
import middy from "middy"
import { authMiddleware } from "../../utils/middleware"

export const func: Handler = async (_event, _context) => {
    try {
        await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
        const pictures = (await pictureModel.find()).map((pic) => pic.toObject() as Picture)

        return {
            statusCode: 200,
            body: JSON.stringify(pictures)
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    } finally {
        await disconnect()
    }
}

// Use authMiddleware to protect the route
export const handler = middy(func).use(authMiddleware())
