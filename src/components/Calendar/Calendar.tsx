import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "../../store"

export const Calendar: FC = () => {
    const [setIsFake] = useCalendarStore((state) => [state.setIsFake])

    useEffect(() => {
        setIsFake(false)
    }, [setIsFake])

    return <CalendarComponent />
}

export default Calendar
