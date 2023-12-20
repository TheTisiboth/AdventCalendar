import { Handler } from "@netlify/functions"
import * as jwt from "jsonwebtoken"
import { connect } from "mongoose"
import { Token, User } from "../../../src/types/types"
import { refreshTokenModel } from "../../models/models"
import { generateAccessToken } from "../../utils/auth"

export const handler: Handler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body!)
        const { refreshToken } = body
        if (refreshToken == null)
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Missing refresh token" })
            }
        await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
        const refreshTokens: Token[] = await refreshTokenModel.find()
        if (!refreshTokens.includes(refreshToken))
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Invalid refresh token" })
            }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err, user) => {
            if (err)
                return {
                    statusCode: 403,
                    body: JSON.stringify({ error: "Invalid refresh token" })
                }
            const accessToken = generateAccessToken(user as User)
            return {
                statusCode: 200,
                body: JSON.stringify({ accessToken: accessToken })
            }
        })
        return { statusCode: 500, body: "dead code" }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}
