import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar } from "@/components/Calendar/Calendar"
import { isInAdventPeriod } from "@/utils/utils"
import { getCalendarById } from "@actions/calendars"
import { getPicturesByCalendarId } from "@actions/pictures"

// Force dynamic rendering to prevent prerendering at build time
// This page requires authentication which is not available during build
export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

/**
 * Archived Calendar View - Server Component with Auth
 * Displays calendar by ID using the reusable Calendar component
 */
export default async function ArchivedCalendarPage({ params }: PageProps) {
  const { id: idParam } = await params
  const id = parseInt(idParam, 10)

  if (isNaN(id)) {
    notFound()
  }

  // Fetch calendar by ID
  const calendar = await getCalendarById(id, true)

  if (!calendar) {
    notFound()
  }

  // Fetch pictures for this calendar
  const pictures = await getPicturesByCalendarId(id)

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

      <Calendar pictures={pictures} year={calendar.year} isArchived={true} />
    </div>
  )
}
