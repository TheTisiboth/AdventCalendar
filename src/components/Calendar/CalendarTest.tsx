import type { PictureWithUrl } from "@actions/pictures"
import CalendarComponent from "./CalendarComponent"

type CalendarTestProps = {
    pictures: PictureWithUrl[]
    year: number
}

/**
 * CalendarTest - Server Component for test/demo calendar
 * Simply passes fake mode flag to CalendarComponent
 */
export const CalendarTest = ({ pictures, year }: CalendarTestProps) => {
    return <CalendarComponent pictures={pictures} year={year} isFakeMode={true} />
}

export default CalendarTest
