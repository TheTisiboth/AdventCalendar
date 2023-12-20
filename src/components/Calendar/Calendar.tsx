import { FC, useContext, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { GlobalContext } from "../../context"

export const Calendar: FC = () => {
    const { setIsFake } = useContext(GlobalContext)

    useEffect(() => {
        setIsFake(false)
    }, [setIsFake])

    return <CalendarComponent />
}

export default Calendar
