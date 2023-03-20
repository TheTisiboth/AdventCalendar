import { Handler } from "@netlify/functions";
import { connect, Schema, model } from "mongoose"
import { dummyPictureModel } from "../../models/models";


export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    await dummyPictureModel.deleteMany({})?.exec()
    dummyPictureModel.insertMany(
      [...Array(24)].map((_, i) => ({
        day: i + 1,
        isOpen: false,
        isOpenable: false,
        key: "biere.jpg"
      }))
    )
    return {
      statusCode: 200,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}