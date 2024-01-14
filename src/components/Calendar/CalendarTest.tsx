import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStoreMulti } from "../../store"

export const CalendarTest: FC = () => {
    const { setIsFake } = useCalendarStoreMulti("setIsFake")

    useEffect(() => {
        setIsFake(true)
    }, [setIsFake])

    return <CalendarComponent />
}

export default CalendarTest
