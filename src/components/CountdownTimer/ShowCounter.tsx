import { FC } from "react"
import "./CountdownTimer.css"
import DateTimeDisplay from "./DateTimeDisplay"

type ShowCounterProps = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export const ShowCounter: FC<ShowCounterProps> = ({ days, hours, minutes, seconds }) => {
    return (
        <div className="show-counter">
            <DateTimeDisplay value={days} type={"Days"} isDanger={days <= 1} />
            <p>:</p>
            <DateTimeDisplay value={hours} type={"Hours"} isDanger={days <= 3 && hours <= 1} />
            <p>:</p>
            <DateTimeDisplay value={minutes} type={"Mins"} isDanger={days <= 1 && hours <= 1 && minutes <= 60} />
            <p>:</p>
            <DateTimeDisplay
                value={seconds}
                type={"Seconds"}
                isDanger={days <= 1 && hours <= 1 && minutes < 60 && seconds <= 60}
            />
        </div>
    )
}
