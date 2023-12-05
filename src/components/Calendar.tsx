import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent";

export const Calendar: FC = () => {
    const calendarTest: boolean = false;
    useEffect(() => {
        console.log("Calendar update")
        console.log(calendarTest)
    })
    return <CalendarComponent test={calendarTest} />
}

export default Calendar