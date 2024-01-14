import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStoreMulti } from "../../store"

export const CalendarTest: FC = () => {
    const { setIsFake,setDate,startingDate } = useCalendarStoreMulti("setIsFake","setDate","startingDate")

    useEffect(() => {
        setIsFake(true)
        setDate(startingDate)
    }, [setIsFake])

    return <CalendarComponent />
}

export default CalendarTest
