import { FC } from "react"

import CalendarComponent from "./CalendarComponent";

export const CalendarTest: FC = () => {
    const calendarTest: boolean = true;

    return <CalendarComponent test={calendarTest} />
}

export default CalendarTest