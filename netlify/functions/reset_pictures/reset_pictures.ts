import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Handler } from "@netlify/functions";
import { connect, Schema, model } from "mongoose"
import { Picture } from "../../../src/types/types";
import { dummyPictureModel } from "../../models/models";

const encode = (data: any) => {
  var str = data.reduce(function (a: string, b: number) { return a + String.fromCharCode(b) }, '');
  return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    await dummyPictureModel.deleteMany({})?.exec()
    const dummyPictures = [...Array(24)].map((_, i) => ({
      day: i + 1,
      isOpen: false,
      isOpenable: false,
      key: "biere.jpg",
    }) as Picture)

    await dummyPictureModel.insertMany(
      dummyPictures
    )
    return {
      statusCode: 200,
      body: JSON.stringify(dummyPictures),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}