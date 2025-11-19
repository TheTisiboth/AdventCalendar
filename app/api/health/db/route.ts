import { NextResponse } from "next/server"
import { prisma } from "@api/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const startTime = Date.now()
        await prisma.$queryRaw`SELECT 1`
        const responseTime = Date.now() - startTime

        return NextResponse.json(
            {
                status: "ok",
                service: "database",
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                service: "database",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        )
    }
}
