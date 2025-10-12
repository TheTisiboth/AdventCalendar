"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Calendar from "@/components/Calendar/Calendar"
import { isInAdventPeriod } from "@/utils/utils"

export default function CalendarPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isInAdventPeriod()) {
      router.push("/home")
    }
  }, [router])

  if (!isInAdventPeriod()) {
    return null
  }

  return <Calendar />
}
