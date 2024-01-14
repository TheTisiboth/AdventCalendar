import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStoreMulti } from "../../store"

export const Calendar: FC = () => {
    const { setIsFake } = useCalendarStoreMulti("setIsFake")

    useEffect(() => {
        setIsFake(false)
    }, [setIsFake])

    return <CalendarComponent />
}

export default Calendar
