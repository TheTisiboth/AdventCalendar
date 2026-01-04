import { FC } from "react"
import Link from "next/link"
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
        <div className="counter-container">
            <div className="show-counter">
                <DateTimeDisplay value={days} type={"Days"} isDanger={false} />
                <p className="colon">:</p>
                <DateTimeDisplay value={hours} type={"Hours"} isDanger={days === 0 && hours <= 3} />
                <p className="colon">:</p>
                <DateTimeDisplay value={minutes} type={"Mins"} isDanger={days === 0 && hours === 0 && minutes <= 30} />
                <p className="colon">:</p>
                <DateTimeDisplay
                    value={seconds}
                    type={"Seconds"}
                    isDanger={days === 0 && hours === 0 && minutes <= 5}
                />
            </div>
            <div className="counter-info">
                <p>
                    Each day from December 1st to 24th reveals a new surprise.
                </p>
                <p>
                    You can also explore previous years&apos; calendars in the <Link href="/archive">archive</Link>.
                </p>
                <p className="test-link">
                    No access? Try the <Link href="/test">test version</Link>.
                </p>
            </div>
        </div>
    )
}
