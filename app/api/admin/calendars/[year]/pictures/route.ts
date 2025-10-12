import { NextRequest, NextResponse } from "next/server"
import { checkAdminAuth } from "@api/lib/auth"
import { prisma } from "@api/lib/prisma"
import { uploadToS3, generateS3Key } from "@api/lib/s3"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        await checkAdminAuth(request)

        const { year: yearParam } = await params
        const year = Number(yearParam)

        const formData = await request.formData()

        // Get pictures and days
        const pictures = formData.getAll("pictures") as File[]
        const days = formData.getAll("days").map(Number)

        // Validate pictures
        if (pictures.length === 0) {
            return NextResponse.json(
                { error: "At least one picture is required" },
                { status: 400 }
            )
        }

        if (pictures.length !== days.length) {
            return NextResponse.json(
                { error: "Picture count and day assignments must match" },
                { status: 400 }
            )
        }

        // Validate unique days
        const uniqueDays = new Set(days)
        if (uniqueDays.size !== days.length) {
            return NextResponse.json(
                { error: "Each picture must be assigned to a unique day" },
                { status: 400 }
            )
        }

        // Validate all days are between 1 and 24
        if (!days.every((day) => day >= 1 && day <= 24)) {
            return NextResponse.json(
                { error: "All day assignments must be between 1 and 24" },
                { status: 400 }
            )
        }

        // Check if calendar exists
        const calendar = await prisma.calendar.findUnique({
            where: { year },
            include: {
                pictures: true
            }
        })

        if (!calendar) {
            return NextResponse.json(
                { error: "Calendar not found" },
                { status: 404 }
            )
        }

        // Check if any of the days are already used
        const existingDays = new Set(calendar.pictures.map((p) => p.day))
        const conflictingDays = days.filter((day) => existingDays.has(day))
        if (conflictingDays.length > 0) {
            return NextResponse.json(
                { error: `Days ${conflictingDays.join(", ")} are already used in this calendar` },
                { status: 400 }
            )
        }

        // Check total picture count doesn't exceed 24
        if (calendar.pictures.length + pictures.length > 24) {
            return NextResponse.json(
                { error: `Cannot add ${pictures.length} pictures. Calendar would have ${calendar.pictures.length + pictures.length} pictures (max 24)` },
                { status: 400 }
            )
        }

        // Upload pictures to S3 and prepare picture data
        const pictureData = await Promise.all(
            pictures.map(async (picture, index) => {
                const day = days[index]
                const arrayBuffer = await picture.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                // Get file extension
                const extension = picture.name.split(".").pop() || "jpg"

                // Generate S3 key
                const key = generateS3Key(year, day, extension)

                // Upload to S3
                await uploadToS3(buffer, key, picture.type)

                // Calculate date for this day (December 1-24)
                const date = new Date(year, 11, day) // 11 = December (0-indexed)

                return {
                    day,
                    year,
                    key,
                    isOpenable: false,
                    isOpen: false,
                    date
                }
            })
        )

        // Add pictures to database
        await prisma.picture.createMany({
            data: pictureData
        })

        return NextResponse.json({ success: true, count: pictures.length })
    } catch (error) {
        console.error("Error adding pictures:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to add pictures" },
            { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
        )
    }
}
