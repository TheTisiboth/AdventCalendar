import { notFound } from "next/navigation"
import Calendar from "@/components/Calendar/Calendar"
import { getCurrentCalendar } from "@actions/calendars"
import { getPicturesByCalendarId } from "@actions/pictures"
import { requireAdventPeriod } from "@safeguards"

// Force dynamic rendering to prevent prerendering at build time
// This page requires authentication which is not available during build
export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  await requireAdventPeriod()

  // Get current calendar for authenticated user
  const calendar = await getCurrentCalendar()

  if (!calendar) {
    notFound()
  }

  // Fetch pictures by calendar ID
  const pictures = await getPicturesByCalendarId(calendar.id)

  return <Calendar pictures={pictures} year={calendar.year} />
}
