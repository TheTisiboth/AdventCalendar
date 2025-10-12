import { NextRequest, NextResponse } from "next/server"
import { requireKindeAdmin } from "@api/lib/kindeAuth"
import { prisma } from "@api/lib/prisma"
import { deleteFromS3 } from "@api/lib/s3"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ year: string; id: string }> }
) {
    try {
        await requireKindeAdmin()

        const { id: idParam } = await params
        const pictureId = Number(idParam)

        // Get picture to delete from S3
        const picture = await prisma.picture.findUnique({
            where: { id: pictureId }
        })

        if (!picture) {
            return NextResponse.json(
                { error: "Picture not found" },
                { status: 404 }
            )
        }

        // Delete picture from S3
        await deleteFromS3(picture.key)

        // Delete picture from database
        await prisma.picture.delete({
            where: { id: pictureId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete picture" },
            { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500 }
        )
    }
}
