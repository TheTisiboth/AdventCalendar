"use client"

import { FC, useLayoutEffect, useState } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "@/store"

export const CalendarTest: FC = () => {
    const { setIsFake, setDate, startingDate } = useCalendarStore("setIsFake", "setDate", "startingDate")
    const [initialized, setInitialized] = useState(false)

    // Use layoutEffect to set isFake BEFORE rendering children
    // This ensures the query in usePictureAPI uses the correct isFake value
    useLayoutEffect(() => {
        setIsFake(true)
        setDate(startingDate)
        setInitialized(true)
    }, [setIsFake, setDate, startingDate])

    // Don't render calendar until isFake is set
    if (!initialized) {
        return null
    }

    return <CalendarComponent year={2025} />
}

export default CalendarTest
