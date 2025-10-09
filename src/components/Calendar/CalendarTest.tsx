"use client"

import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "@/store"

export const CalendarTest: FC = () => {
    const { setIsFake, setDate, startingDate } = useCalendarStore("setIsFake", "setDate", "startingDate")

    useEffect(() => {
        setIsFake(true)
        setDate(startingDate)
    }, [setIsFake, setDate, startingDate])

    return <CalendarComponent year={2025} />
}

export default CalendarTest
