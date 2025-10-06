"use client"

import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "../../store"

export const Calendar: FC = () => {
    const { setIsFake,setDate } = useCalendarStore("setIsFake","setDate")

    useEffect(() => {
        setIsFake(false)
        setDate(new Date())
    }, [setIsFake])

    return <CalendarComponent />
}

export default Calendar
