import { Handler } from '@netlify/functions'
import { connect } from "mongoose"
import { dummyPictureModel, pictureModel } from '../../models/models'
import { Picture } from '../../../src/types/types'

type Body = {
  test: boolean
}
export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    const body: Body = JSON.parse(event.body!)
    const { test } = body
    let pictures: Picture[]
    if (test)
      pictures = (await dummyPictureModel.find()).map((pic) => pic.toObject() as Picture)
    else
      pictures = (await pictureModel.find()).map((pic) => pic.toObject() as Picture)

    return {
      statusCode: 200,
      body: JSON.stringify(pictures),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}
