import { getCalendars } from "@actions/calendars"
import { ArchiveCard } from "@/components/Archive/ArchiveCard"

/**
 * Archive page - Server Component
 * Displays all available calendar years for viewing past Advent calendars
 */
export default async function ArchivePage() {
  const calendars = await getCalendars({ archived: true, isPublished: true })

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Calendar Archive</h1>

      {!calendars || calendars.length === 0 ? (
        <p>No calendars available yet.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {calendars.map((calendar) => (
            <ArchiveCard key={calendar.id} calendar={calendar} />
          ))}
        </div>
      )}
    </div>
  )
}
