import { FC } from "react"

import CalendarComponent from "./CalendarComponent";

export const Calendar: FC = () => {
    const calendarTest: boolean = false;

    return <CalendarComponent test={calendarTest} />
}

export default Calendar