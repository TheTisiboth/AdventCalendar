import { Handler } from "@netlify/functions";
import { connect } from "mongoose";
import { refreshTokenModel } from "../../models/models";

export const handler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body!)
    const { refreshToken } = body
    if (refreshToken == null) return {
      statusCode: 401,
      body: JSON.stringify({ error: "Missing refresh token" }),
    }
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    await refreshTokenModel.deleteOne({ token: refreshToken })
    return {
      statusCode: 204,
      body: JSON.stringify({}),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}