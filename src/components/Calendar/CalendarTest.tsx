"use client"

import { FC, useLayoutEffect } from "react"
import type { PictureWithUrl } from "@actions/pictures"
import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "@/store"

type CalendarTestProps = {
    pictures: PictureWithUrl[]
}

export const CalendarTest: FC<CalendarTestProps> = ({ pictures }) => {
    const { setIsFake, setDate, startingDate } = useCalendarStore("setIsFake", "setDate", "startingDate")

    // Use layoutEffect to set isFake BEFORE rendering children
    useLayoutEffect(() => {
        setIsFake(true)
        setDate(startingDate)
    }, [setIsFake, setDate, startingDate])

    return <CalendarComponent pictures={pictures} year={2025} />
}

export default CalendarTest
