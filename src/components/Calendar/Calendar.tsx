import { FC, useContext, useEffect } from "react"

import CalendarComponent from "./CalendarComponent";
import { GlobalContext } from "../../context";
import { useQueryClient } from "@tanstack/react-query";

export const Calendar: FC = () => {
    const { setIsFake } = useContext(GlobalContext)

    useEffect(() => {
        setIsFake(false)
    }, [])

    return <CalendarComponent />
}

export default Calendar