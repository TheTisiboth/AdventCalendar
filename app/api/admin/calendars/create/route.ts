import { NextRequest, NextResponse } from "next/server"
import { requireKindeAdmin } from "@api/lib/kindeAuth"
import { prisma } from "@api/lib/prisma"
import { uploadToS3, generateS3Key } from "@api/lib/s3"

export async function POST(request: NextRequest) {
    try {
        await requireKindeAdmin()

        const formData = await request.formData()

        // Extract calendar data
        const year = Number(formData.get("year"))
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const isPublished = formData.get("isPublished") === "true"
        const isArchived = formData.get("isArchived") === "true"

        // Validate required fields
        if (!year || !title) {
            return NextResponse.json(
                { error: "Year and title are required" },
                { status: 400 }
            )
        }

        // Check if calendar for this year already exists
        const existingCalendar = await prisma.calendar.findUnique({
            where: { year }
        })

        if (existingCalendar) {
            return NextResponse.json(
                { error: `Calendar for year ${year} already exists` },
                { status: 400 }
            )
        }

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

        if (pictures.length > 24) {
            return NextResponse.json(
                { error: "Maximum 24 pictures allowed" },
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

        // If published, must have exactly 24 pictures
        if (isPublished && pictures.length !== 24) {
            return NextResponse.json(
                { error: "Published calendars must have exactly 24 pictures. Uncheck 'Published' to save as draft." },
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

        // Create calendar and pictures in a transaction
        const calendar = await prisma.$transaction(async (tx) => {
            const newCalendar = await tx.calendar.create({
                data: {
                    year,
                    title,
                    description: description || null,
                    isPublished,
                    isArchived
                }
            })

            await tx.picture.createMany({
                data: pictureData
            })

            return newCalendar
        })

        return NextResponse.json({ success: true, calendar })
    } catch (error) {
        console.error("Error creating calendar:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create calendar" },
            { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
        )
    }
}
