import { CalendarTest } from "@/components/Calendar/CalendarTest"
import { getTestPictures } from "@actions/pictures"
import { notFound } from "next/navigation"

// Force dynamic rendering so database is accessed at request time, not build time
export const dynamic = 'force-dynamic'

/**
 * Test Page - Public
 * Displays a test calendar with demo mode enabled
 * Uses fake pictures from the test calendar
 */
export default async function TestPage() {
    try {
        const { pictures, year } = await getTestPictures()

        if (pictures.length === 0) {
            notFound()
        }

        return <CalendarTest pictures={pictures} year={year} />
    } catch {
        notFound()
    }
}
