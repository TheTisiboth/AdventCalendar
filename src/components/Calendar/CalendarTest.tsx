"use client"

import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "../../store"

export const CalendarTest: FC = () => {
    const { setIsFake,setDate,startingDate } = useCalendarStore("setIsFake","setDate","startingDate")

    useEffect(() => {
        setIsFake(true)
        setDate(startingDate)
    }, [setIsFake])

    return <CalendarComponent />
}

export default CalendarTest
