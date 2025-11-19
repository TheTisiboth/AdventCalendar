import { NextResponse } from "next/server"
import { prisma } from "@api/lib/prisma"
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3"
import { env } from "@/config"

export const dynamic = "force-dynamic"

export async function GET() {
    const checks = {
        database: { status: "unknown", responseTime: 0 },
        s3: { status: "unknown", responseTime: 0 }
    }
    let overallStatus = "ok"
    let errorMessage: string | undefined

    try {
        // Test database connection
        const dbStartTime = Date.now()
        await prisma.$queryRaw`SELECT 1`
        checks.database = {
            status: "connected",
            responseTime: Date.now() - dbStartTime
        }
    } catch (error) {
        checks.database.status = "disconnected"
        overallStatus = "error"
        errorMessage = `DB: ${error instanceof Error ? error.message : "Unknown error"}`
    }

    try {
        // Test S3 connection with HeadBucket (lightweight check)
        const s3StartTime = Date.now()
        const s3Client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            }
        })
        await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET_NAME }))
        checks.s3 = {
            status: "connected",
            responseTime: Date.now() - s3StartTime
        }
    } catch (error) {
        checks.s3.status = "disconnected"
        overallStatus = "error"
        errorMessage = errorMessage
            ? `${errorMessage}; S3: ${error instanceof Error ? error.message : "Unknown error"}`
            : `S3: ${error instanceof Error ? error.message : "Unknown error"}`
    }

    const statusCode = overallStatus === "ok" ? 200 : 503

    return NextResponse.json(
        {
            status: overallStatus,
            checks: {
                database: checks.database.status,
                dbResponseTime: `${checks.database.responseTime}ms`,
                s3: checks.s3.status,
                s3ResponseTime: `${checks.s3.responseTime}ms`
            },
            ...(errorMessage && { error: errorMessage }),
            timestamp: new Date().toISOString()
        },
        { status: statusCode }
    )
}
