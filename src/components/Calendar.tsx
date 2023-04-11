import { useContext } from "react"
import { GlobalContext } from "../context"

const Calendar = () => {
    const context = useContext(GlobalContext)
    console.log(context)
    return (
        <>
            {context.user?.name}
        </>
    )
}

export default Calendar