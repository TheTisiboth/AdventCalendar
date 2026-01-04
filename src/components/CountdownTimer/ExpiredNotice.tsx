import Link from "next/link"
import dayjs from "dayjs"
import { useCalendarStore } from "@/store"

export const ExpiredNotice = () => {
    const { startingDate, isStarted, setIsStarted } = useCalendarStore("startingDate", "isStarted", "setIsStarted")

    if (dayjs(new Date()).isAfter(startingDate)) {
        if (!isStarted()) setIsStarted(true)
    }

    return (
        <div className="expired-notice">
            <span>The advent calendar is open!</span>
            <p>
                Open your <Link href="/calendar">advent calendar</Link> to discover daily surprises.
            </p>
            <p className="secondary-text">
                Each day unlocks a new surprise. Come back daily to open the next door.
            </p>
            <p className="test-link">
                No access? Try the <Link href="/test">test version</Link>.
            </p>
        </div>
    )
}
