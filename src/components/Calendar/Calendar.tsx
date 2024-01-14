import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStoreMulti } from "../../store"

export const Calendar: FC = () => {
    const { setIsFake,setDate } = useCalendarStoreMulti("setIsFake","setDate")

    useEffect(() => {
        setIsFake(false)
        setDate(new Date())
    }, [setIsFake])

    return <CalendarComponent />
}

export default Calendar
