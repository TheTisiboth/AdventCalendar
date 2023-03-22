import { Handler } from '@netlify/functions'
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3"
import { orderBy } from "lodash"
import { connect, Schema, model } from "mongoose"
import { dummyPictureModel } from '../../models/models'
import { Picture } from '../../../src/types/types'

export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    const dummyPictures: Picture[] = (await dummyPictureModel.find()).map((pic) => pic.toObject() as Picture)

    return {
      statusCode: 200,
      body: JSON.stringify(dummyPictures),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() + " KO" }
  }
}
