import { NextResponse } from "next/server"
import { prisma } from "@api/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        // Test database connection with a simple query
        const startTime = Date.now()
        await prisma.$queryRaw`SELECT 1`
        const dbResponseTime = Date.now() - startTime

        return NextResponse.json(
            {
                status: "ok",
                database: "connected",
                dbResponseTime: `${dbResponseTime}ms`,
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                database: "disconnected",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        )
    }
}
