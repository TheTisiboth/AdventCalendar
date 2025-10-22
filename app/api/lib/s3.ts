import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer"
import { env } from "@/config"

const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
})

const BUCKET_NAME = env.AWS_S3_BUCKET_NAME
const CLOUDFRONT_DOMAIN = env.NEXT_PUBLIC_CDN_URL
const CLOUDFRONT_KEY_PAIR_ID = env.CLOUDFRONT_KEY_PAIR_ID
const CLOUDFRONT_PRIVATE_KEY = env.CLOUDFRONT_PRIVATE_KEY

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

export async function deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    })

    await s3Client.send(command)
}

export async function deleteMultipleFromS3(keys: string[]): Promise<void> {
    if (keys.length === 0) return

    const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
            Objects: keys.map((key) => ({ Key: key })),
            Quiet: false
        }
    })

    await s3Client.send(command)
}

/**
 * Generate a CloudFront signed URL for a given S3 object key
 * Returns a short, cached URL through CloudFront CDN
 * @param key - S3 object key (e.g., "2024/1.jpg")
 * @returns CloudFront signed URL valid for 1 hour
 */
export function getSignedUrl(key: string): string {
    const url = `${CLOUDFRONT_DOMAIN}/${key}`
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Generate CloudFront signed URL
    const signedUrl = getCloudFrontSignedUrl({
        url,
        keyPairId: CLOUDFRONT_KEY_PAIR_ID,
        privateKey: CLOUDFRONT_PRIVATE_KEY,
        dateLessThan: expiresAt.toISOString()
    })

    return signedUrl
}
