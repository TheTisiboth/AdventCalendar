import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent";
import { useAPI } from "../../hooks/useAPI";

export const CalendarTest: FC = () => {
    const calendarTest: boolean = true;
    const { resetPictures } = useAPI()

    useEffect(() => {
        resetPictures()
    }, [])

    return <CalendarComponent test={calendarTest} />
}

export default CalendarTest