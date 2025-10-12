import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "eu-west-3",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ""

export async function uploadToS3(
    file: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType
    })

    await s3Client.send(command)

    return key
}

export function generateS3Key(year: number, day: number, extension: string): string {
    return `${year}/${day}.${extension}`
}
