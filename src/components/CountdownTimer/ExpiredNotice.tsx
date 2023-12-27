import { Link } from "@tanstack/react-router"
import dayjs from "dayjs"
import { useCalendarStore } from "../../store"

export const ExpiredNotice = () => {
    const [startingDate, isStarted, setIsStarted] = useCalendarStore((state) => [
        state.startingDate,
        state.isStarted,
        state.setIsStarted
    ])
    if (dayjs(new Date()).isAfter(startingDate)) {
        if (!isStarted) setIsStarted(true)
    }

    return (
        <div className="expired-notice">
            <span>Time has come!!!</span>
            <p>
                You can now open your <Link to="/calendar">advent calendar</Link>
            </p>
            <p>
                If you don&apos;t have access, you can still try the <Link to="/test">test version.</Link>
            </p>
        </div>
    )
}
