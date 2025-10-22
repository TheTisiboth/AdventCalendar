import { CalendarTest } from "@/components/Calendar/CalendarTest"
import { getDummyPictures } from "@actions/pictures"
import { notFound } from "next/navigation"

/**
 * Test Page - Public
 * Displays a test calendar (fixed year) with demo mode enabled
 * Uses dummy/fake pictures from the DummyPicture table
 */
export default async function TestPage() {
    const TEST_YEAR = 1996

    try {
        // Fetch dummy pictures (fake data for testing)
        const pictures = await getDummyPictures()

        if (pictures.length === 0) {
            // If no dummy pictures exist, show 404
            notFound()
        }

        return <CalendarTest pictures={pictures} year={TEST_YEAR} />
    } catch {
        // If something goes wrong, show 404
        notFound()
    }
}
