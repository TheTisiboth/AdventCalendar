import { Handler } from '@netlify/functions'
import { GetObjectCommand, ListObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3"

const encode = (data: any) => {
  var str = data.reduce(function (a: string, b: number) { return a + String.fromCharCode(b) }, '');
  return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

export const handler: Handler = async (event, context) => {
  try {
    const aws = new S3Client({
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
      region: process.env.DEFAULT_REGION!,
    })

    const listBucket = await aws.send(new ListObjectsV2Command({ Bucket: "adventcalenderbucket" }))
    const promises = listBucket.Contents?.map((pic) => aws.send(new GetObjectCommand({ Bucket: "adventcalenderbucket", Key: pic.Key })))
    const pics = await Promise.all(promises!)
    const encodedPics = await Promise.all(pics.map(async (pic) => "data:image/jpeg;base64," + encode(await pic.Body?.transformToByteArray())))
    return {
      statusCode: 200,
      body: JSON.stringify(encodedPics),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() + " KO" }
  }
}
