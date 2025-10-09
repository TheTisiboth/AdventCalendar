import Link from "next/link"
import dayjs from "dayjs"
import { useCalendarStore } from "@/store"

export const ExpiredNotice = () => {
    const { startingDate, isStarted, setIsStarted } = useCalendarStore("startingDate", "isStarted", "setIsStarted")
    if (dayjs(new Date()).isAfter(startingDate)) {
        if (!isStarted) setIsStarted(true)
    }

    return (
        <div className="expired-notice">
            <span>Time has come!!!</span>
            <p>
                You can now open your <Link href="/calendar">advent calendar</Link>
            </p>
            <p>
                If you don&apos;t have access, you can still try the <Link href="/test">test version.</Link>
            </p>
        </div>
    )
}
