"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { Calendar } from "@prisma/client"
import { getCalendars } from "@actions/calendars"

/**
 * Archive page - Client Component
 * Displays all available calendar years for viewing past Advent calendars
 */
export default function ArchivePage() {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const data = await getCalendars({ archived: true, isPublished: true })
        setCalendars(data)
      } catch {
        // Silently fail - user will see empty state
      } finally {
        setLoading(false)
      }
    }
    fetchCalendars()
  }, [])

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
  }

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
            <Link
              key={calendar.id}
              href={`/archive/${calendar.year}`}
              style={{
                display: "block",
                padding: "1.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                textDecoration: "none",
                color: "inherit",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <h2 style={{ margin: "0 0 0.5rem 0" }}>{calendar.title}</h2>
              <p style={{ color: "#666", margin: "0 0 0.5rem 0" }}>
                Year: {calendar.year}
              </p>
              {calendar.description && (
                <p style={{ fontSize: "0.9rem", color: "#888", margin: 0 }}>
                  {calendar.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
      </div>
  )
}
