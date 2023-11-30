import { Handler } from "@netlify/functions";
import { connect } from "mongoose"
import { Picture } from "../../../src/types/types";
import { dummyPictureModel, pictureModel } from "../../models/models";

const encode = (data: any) => {
  var str = data.reduce(function (a: string, b: number) { return a + String.fromCharCode(b) }, '');
  return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

export const handler: Handler = async (event, context) => {
  try {
    await connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DATABASE })
    await dummyPictureModel.collection.drop()

    const dummyPictures = [...Array(24)].map((_, i) => {
      const date = new Date()
      date.setUTCHours(0, 0, 0, 0)
      date.setUTCMonth(11)
      date.setUTCDate(i + 1)
      return {
        day: i + 1,
        isOpen: false,
        isOpenable: false,
        key: i + 1 + ".jpg",
        date: date,
      } as Picture
    })

    await dummyPictureModel.insertMany(
      dummyPictures
    )



    // await pictureModel.collection.drop()

    // const pictures = [...Array(24)].map((_, i) => {
    //   const date = new Date()
    //   date.setUTCHours(0, 0, 0, 0)
    //   date.setUTCMonth(11)
    //   date.setUTCDate(i + 1)
    //   return {
    //     day: i + 1,
    //     isOpen: false,
    //     isOpenable: false,
    //     key: i + 1 + ".jpg",
    //     date: date,
    //   } as Picture
    // })

    // await pictureModel.insertMany(
    //   pictures
    // )
    return {
      statusCode: 200,
      body: JSON.stringify(dummyPictures),
    }
  } catch (error) {
    console.log(error)
    return { statusCode: 500, body: error.toString() }
  }
}