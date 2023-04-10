import { Handler } from "@netlify/functions";
import * as jwt from "jsonwebtoken"

export const handler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body!)
    const accessToken = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET!)
    return {
      statusCode: 200,
      body: JSON.stringify({ accessToken: accessToken }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}