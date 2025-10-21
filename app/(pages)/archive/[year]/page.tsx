"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar } from "@/components/Calendar/Calendar"
import { isInAdventPeriod } from "@/utils/utils"
import { getCalendar } from "@actions/calendars"

type PageProps = {
  params: Promise<{ year: string }>
}

/**
 * Archived Calendar View - Client Component with Auth
 * Displays calendar for a specific year using the reusable Calendar component
 */
export default function ArchivedCalendarPage({ params }: PageProps) {
  const router = useRouter()
  const [year, setYear] = useState<number | null>(null)
  const [calendarTitle, setCalendarTitle] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const inAdventPeriod = isInAdventPeriod()

  useEffect(() => {
    async function init() {
      const { year: yearParam } = await params
      const parsedYear = parseInt(yearParam)

      if (isNaN(parsedYear)) {
        router.push("/archive")
        return
      }

      setYear(parsedYear)

      // Verify calendar exists
      try {
        const calendar = await getCalendar(parsedYear)

        if (calendar) {
          setCalendarTitle(calendar.title)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [params, router])

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
  }

  if (notFound) {
    return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Calendar Not Found</h1>
        <p>No calendar found for year {year}.</p>
        <Link href="/archive" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Back to archive
        </Link>
      </div>
    )
  }

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

        {calendarTitle && <h1 style={{ marginBottom: "1rem" }}>{calendarTitle}</h1>}

        {year && <Calendar year={year} isArchived={true} />}
      </div>
  )
}
