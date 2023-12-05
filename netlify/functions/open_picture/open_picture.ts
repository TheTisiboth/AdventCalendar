import { Handler } from "@netlify/functions";
import { connect } from "mongoose"
import { dummyPictureModel, pictureModel } from "../../models/models";
import { Picture } from "../../../src/types/types";

type Body = {
  test: boolean
}
export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    const body: Body = JSON.parse(event.body!)
    const test = false
    let picture: Picture
    const day = event.queryStringParameters?.day

    let pic: Picture | null
    if (test)
      pic = await dummyPictureModel.findOneAndUpdate({ day }, { isOpen: true }).exec()
    else
      pic = await pictureModel.findOneAndUpdate({ day }, { isOpen: true }).exec()

    return {
      statusCode: 200,
      body: JSON.stringify({ pic }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}
