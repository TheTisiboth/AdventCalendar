import { Link } from "@tanstack/react-router"
import { useContext } from "react"
import { GlobalContext } from "../../context"
import dayjs from "dayjs"

export const ExpiredNotice = () => {
    const { startingDate, isStarted, setIsStarted } = useContext(GlobalContext)

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
