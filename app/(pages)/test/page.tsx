import { CalendarTest } from "@/components/Calendar/CalendarTest"
import { getTestPictures } from "@actions/pictures"
import { notFound } from "next/navigation"
import { TEST_YEAR } from "@/constants"

// Force dynamic rendering so database is accessed at request time, not build time
export const dynamic = 'force-dynamic'

/**
 * Test Page - Public
 * Displays a test calendar (fixed year) with demo mode enabled
 * Uses fake pictures from the test calendar (year 1996)
 */
export default async function TestPage() {
    try {
        const pictures = await getTestPictures()

        if (pictures.length === 0) {
            notFound()
        }

        return <CalendarTest pictures={pictures} year={TEST_YEAR} />
    } catch {
        notFound()
    }
}
