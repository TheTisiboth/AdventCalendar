import { FC, useContext, useEffect } from "react"

import CalendarComponent from "./CalendarComponent";
import { GlobalContext } from "../../context";
import { useQueryClient } from "@tanstack/react-query";

export const CalendarTest: FC = () => {
    const { setIsFake } = useContext(GlobalContext)

    useEffect(() => {
        setIsFake(true)
    }, [])

    return <CalendarComponent />
}

export default CalendarTest