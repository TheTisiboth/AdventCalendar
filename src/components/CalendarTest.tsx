import { FC, useEffect } from "react"

import CalendarComponent from "./CalendarComponent";
import { NETLIFY_FUNCTIONS_PATH } from "../constants";
import { useQueryClient } from "@tanstack/react-query";

export const CalendarTest: FC = () => {
    const calendarTest: boolean = true;
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log("CalendarTest update")
        console.log(calendarTest)

    })

    useEffect(() => {
        resetPictures()

    }, [])

    const resetPictures = async () => {
        console.log("res")
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "reset_pictures")
        queryClient.invalidateQueries({ queryKey: ["pictures"] });
        console.log("reset ", response)

    }

    return <CalendarComponent test={calendarTest} resetPictures={resetPictures} />
}

export default CalendarTest