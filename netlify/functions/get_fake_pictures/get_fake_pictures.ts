import { Handler } from "@netlify/functions"
import { connect, disconnect } from "mongoose"
import { dummyPictureModel } from "../../models/models"
import { Picture } from "../../../src/types/types"

export const handler: Handler = async (_event, _context) => {
    try {
        await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
        const pictures = (await dummyPictureModel.find()).map((pic) => pic.toObject() as Picture)

        return {
            statusCode: 200,
            body: JSON.stringify(pictures)
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    } finally {
        void disconnect()
    }
}
