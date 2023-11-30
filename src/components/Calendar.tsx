import { FC, useContext, useEffect } from "react"
import { GlobalContext } from "../context"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Grid } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { NETLIFY_FUNCTIONS_PATH } from "../constants";
import { Picture } from "../types/types";
import { DayGrid } from "./Grid";

export const Calendar: FC = () => {
    const test: boolean = false;
    const queryClient = useQueryClient();
    const context = useContext(GlobalContext)

    useEffect(() => {
        console.log("ctx", context.date)

    }, [context])

    useEffect(() => {
        context.setDate(new Date())
        context.setIsFake(false)
    }, [])
    console.log("ctx date live", context.date)

    const fetchPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "get_pictures", {
            method: "POST", body: JSON.stringify({ test })
        })
        return response.json()
    }

    const { data: pictures, isLoading: isPictureLoading, } = useQuery<Picture[]>({ queryKey: ["pictures"], queryFn: fetchPictures })

    return (
        <div className="App">
            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures &&
                <Grid container >
                    <Grid item xs={1} />
                    <Grid item xs={10}>
                        <DayGrid pictures={pictures} test />
                    </Grid>
                </Grid>}
        </div>
    )
}

export default Calendar