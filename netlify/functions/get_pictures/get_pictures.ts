import { Handler } from '@netlify/functions'
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3"
import { orderBy } from "lodash"
import { connect, Schema, model } from "mongoose"
import { dummyPictureModel } from '../../models/models'
import { Picture } from '../../../src/types/types'

const encode = (data: any) => {
  var str = data.reduce(function (a: string, b: number) { return a + String.fromCharCode(b) }, '');
  return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    const dummyPictures: Picture[] = (await dummyPictureModel.find()).map((pic) => pic.toObject() as Picture)
    const aws = new S3Client({
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
      region: process.env.DEFAULT_REGION!,
    })

    // Fetch every pictures that were listed in the Bucket
    const promises = dummyPictures.map((pic) => aws.send(new GetObjectCommand({ Bucket: "adventcalenderbucket", Key: pic.key })))
    const pics = await Promise.all(promises!)
    // Encode the pictures
    const encodedPics = await Promise.all(pics.map(async (pic) => "data:image/jpeg;base64," + encode(await pic.Body?.transformToByteArray())))
    for (const [index, value] of dummyPictures.entries()) {
      value.content = encodedPics[index]
    }
    // encodedPics.forEach((pic, index) => dummyPictures[index].content = pic)
    return {
      statusCode: 200,
      body: JSON.stringify(dummyPictures),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() + " KO" }
  }
}
