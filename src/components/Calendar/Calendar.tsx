import { FC } from "react"
import type { PictureWithUrl } from "@actions/pictures"
import CalendarComponent from "./CalendarComponent"

type CalendarProps = {
    pictures: PictureWithUrl[]
    year: number
    isArchived?: boolean
}

export const Calendar: FC<CalendarProps> = ({ pictures, year, isArchived = false }) => {
    return <CalendarComponent pictures={pictures} year={year} isArchived={isArchived} />
}

export default Calendar
