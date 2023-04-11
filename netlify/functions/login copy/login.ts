import { Handler } from "@netlify/functions";
import * as jwt from "jsonwebtoken"
import { Credentials, DBUser } from "../../../src/types/types";
import { generateAccessToken } from "../../utils/auth";

export const handler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body!)
    const user: DBUser = {
      name: body.name!
    }
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!)
    return {
      statusCode: 200,
      body: JSON.stringify({ accessToken: accessToken, refreshToken: refreshToken }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}