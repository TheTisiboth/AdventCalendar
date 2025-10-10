import { FC } from "react"

type DateTimeDisplayProps = {
    value: number
    type: string
    isDanger: boolean
}
const DateTimeDisplay: FC<DateTimeDisplayProps> = ({ value, type, isDanger }) => {
    return (
        <div className={isDanger ? "countdown danger" : "countdown"}>
            <p suppressHydrationWarning>{value}</p>
            <span>{type}</span>
        </div>
    )
}

export default DateTimeDisplay
