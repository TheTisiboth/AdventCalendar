"use client"

import Link from "next/link"
import { useState } from "react"
import type { Calendar } from "@prisma/client"

type ArchiveCardProps = {
  calendar: Calendar
}

export const ArchiveCard = ({ calendar }: ArchiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={`/archive/${calendar.id}`}
      style={{
        display: "block",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 style={{ margin: "0 0 0.5rem 0" }}>{calendar.year} - {calendar.title}</h2>
      {calendar.description && (
        <p style={{ fontSize: "0.9rem", color: "#888", margin: 0 }}>
          {calendar.description}
        </p>
      )}
    </Link>
  )
}
