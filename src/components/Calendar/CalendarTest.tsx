import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { useCalendarStore } from "../../store"

export const CalendarTest: FC = () => {
    const [setIsFake] = useCalendarStore((state) => [state.setIsFake])

    useEffect(() => {
        setIsFake(true)
    }, [setIsFake])

    return <CalendarComponent />
}

export default CalendarTest
