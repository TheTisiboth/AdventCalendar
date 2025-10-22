import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar } from "@/components/Calendar/Calendar"
import { isInAdventPeriod } from "@/utils/utils"
import { getCalendar } from "@actions/calendars"
import { getPictures } from "@actions/pictures"
import { validateYearParam } from "@safeguards"

type PageProps = {
  params: Promise<{ year: string }>
}

/**
 * Archived Calendar View - Server Component with Auth
 * Displays calendar for a specific year using the reusable Calendar component
 */
export default async function ArchivedCalendarPage({ params }: PageProps) {
  const { year: yearParam } = await params
  const year = validateYearParam(yearParam, "/archive")

  // Fetch calendar and pictures on the server
  const calendar = await getCalendar(year, true)

  if (!calendar) {
    notFound()
  }

  // Fetch pictures for this year
  const pictures = await getPictures(year)

  const inAdventPeriod = isInAdventPeriod()

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link href="/archive" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Back to archive
        </Link>
        {inAdventPeriod && (
          <>
            <span style={{ color: "#999" }}>|</span>
            <Link href="/calendar" style={{ color: "#0070f3", textDecoration: "none" }}>
              Current calendar
            </Link>
          </>
        )}
      </div>

      <h1 style={{ marginBottom: "1rem" }}>{calendar.title}</h1>

      <Calendar pictures={pictures} year={year} isArchived={true} />
    </div>
  )
}
