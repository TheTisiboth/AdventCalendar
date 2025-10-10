"use client"

import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "@/store"
import { getCurrentCalendarYear } from "@/utils/utils"

type CalendarProps = {
    year?: number
    isArchived?: boolean
}

export const Calendar: FC<CalendarProps> = ({ year, isArchived = false }) => {
    const { setIsFake, setDate } = useCalendarStore("setIsFake", "setDate")

    // Use provided year or calculate current year
    const displayYear = year ?? getCurrentCalendarYear()

    useEffect(() => {
        // For archived calendars, we don't want fake mode
        setIsFake(false)
        setDate(new Date())
    }, [setIsFake, setDate, isArchived])

    return <CalendarComponent year={displayYear} isArchived={isArchived} />
}

export default Calendar
