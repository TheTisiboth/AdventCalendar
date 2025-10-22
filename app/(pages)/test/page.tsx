import { CalendarTest } from "@/components/Calendar/CalendarTest"
import { getPictures } from "@actions/pictures"
import { notFound } from "next/navigation"

/**
 * Test Page - Public
 * Displays a test calendar (fixed year) with demo mode enabled
 * Only works if a published calendar exists for the test year
 */
export default async function TestPage() {
    const TEST_YEAR = 2025

    try {
        // Fetch public calendar pictures (requireAuth = false)
        const pictures = await getPictures(TEST_YEAR, false)

        return <CalendarTest pictures={pictures} year={TEST_YEAR} />
    } catch {
        // If no published test calendar exists, show 404
        notFound()
    }
}
