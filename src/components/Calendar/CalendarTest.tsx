"use client"

import { useEffect } from "react"
import type { PictureWithUrl } from "@actions/pictures"
import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "@/store"

type CalendarTestProps = {
    pictures: PictureWithUrl[]
    year: number
}

/**
 * CalendarTest - Client Component for test/demo calendar
 * Sets the date to December 1st of the current year on mount
 */
export const CalendarTest = ({ pictures, year }: CalendarTestProps) => {
    const { setDate } = useCalendarStore("setDate")

    useEffect(() => {
        // Set date to December 1st of the current year
        const currentYear = new Date().getFullYear()
        setDate(new Date(currentYear, 11, 1)) // Month is 0-indexed, so 11 = December
    }, [setDate])

    return <CalendarComponent pictures={pictures} year={year} isFakeMode={true} />
}

export default CalendarTest
