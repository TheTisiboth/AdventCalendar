import { FC, useContext, useEffect } from "react"

import CalendarComponent from "./CalendarComponent"
import { GlobalContext } from "../../context"

export const CalendarTest: FC = () => {
    const { setIsFake } = useContext(GlobalContext)

    useEffect(() => {
        setIsFake(true)
    }, [setIsFake])

    return <CalendarComponent />
}

export default CalendarTest
