import { Handler } from "@netlify/functions";
import * as jwt from "jsonwebtoken"
import { Credentials, DBUser, User } from "../../../src/types/types";
import { userModel } from "../../models/models";
import { generateAccessToken } from "../../utils/auth";
import bcrypt from "bcrypt"
import { connect } from "mongoose";

export const handler: Handler = async (event, context) => {
  console.log("ok")
  try {
    console.log(JSON.parse(event.body!))
    const body: Credentials = JSON.parse(event.body!)
    const { name, password } = body
    console.log("start hash")
    // const hashedPassword = bcrypt.hashSync(password, 12)
    console.log("done hash")
    // console.log(hashedPassword)
    console.log("start find")
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    const DBUser = await userModel.findOne({ name }).exec()
    console.log("found")
    console.log("user", DBUser)
    if (DBUser) {
      const isPasswordCorrect = bcrypt.compareSync(password, DBUser.password)
      console.log("test", isPasswordCorrect)
      if (isPasswordCorrect) {
        const user: User = { name: DBUser.name, id: DBUser._id.toString(), role: DBUser.role }
        console.log(user)
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!)
        return {
          statusCode: 200,
          body: JSON.stringify({ user: user, accessToken: accessToken, refreshToken: refreshToken }),
        }
      }
    }
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid credentials" }),
    }

  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}