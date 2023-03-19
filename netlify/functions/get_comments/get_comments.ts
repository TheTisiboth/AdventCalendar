import { Handler } from "@netlify/functions";
import { connect, Schema, model } from "mongoose"
import { commentModel } from "../../models/models";


export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })

    const comments = await commentModel.find().limit(10)
    return {
      statusCode: 200,
      body: JSON.stringify(comments),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}