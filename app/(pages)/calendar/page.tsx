"use client"

import { Auth } from "@/components/Auth"
import Calendar from "@/components/Calendar/Calendar"

export default function CalendarPage() {
  return (
    <Auth>
      <Calendar />
    </Auth>
  )
}
