import { NextResponse } from "next/server"
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3"
import { env } from "@/config"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const startTime = Date.now()
        const s3Client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            }
        })
        await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET_NAME }))
        const responseTime = Date.now() - startTime

        return NextResponse.json(
            {
                status: "ok",
                service: "s3",
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                service: "s3",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        )
    }
}
