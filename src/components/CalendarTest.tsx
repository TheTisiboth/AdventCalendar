import { Button, Grid } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FC, useState, useContext, useEffect } from "react"
import { NETLIFY_FUNCTIONS_PATH } from "../constants"
import { Picture } from "../types/types"
import { DayGrid } from "./Grid"
import { DateCalendar } from "@mui/x-date-pickers"
import dayjs from "dayjs"
import { GlobalContext } from "../context"


export const CalendarTest: FC = () => {
    const test: boolean = true;
    const queryClient = useQueryClient();
    const context = useContext(GlobalContext)

    useEffect(() => {
        console.log("ctx", context.date)

    }, [context])
    console.log("ctx date live", context.date)

    useEffect(() => {
        context.setDate(new Date("2023-12-01"))
        context.setIsFake(true)
    }, [])


    const resetPictures = async () => {
        console.log("res")
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "reset_pictures", {
            method: "POST", body: JSON.stringify({ test })
        })
        queryClient.invalidateQueries({ queryKey: ["pictures"] });
        console.log("reset ", response)

    }

    const fetchCredentials = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "get_presigned_cookie")
        queryClient.invalidateQueries({ queryKey: ["cookies"] });
        console.log("cookie ", response)

    }

    const fetchPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "get_pictures", {
            method: "POST", body: JSON.stringify({ test })
        })
        return response.json()
    }

    const { data: pictures, isLoading: isPictureLoading, } = useQuery<Picture[]>({ queryKey: ["pictures"], queryFn: fetchPictures })


    const handleCalendarChange = (date: dayjs.Dayjs | null) => {
        console.log("date", date?.toDate())
        if (date) {
            context.setDate(date.toDate())
        }
    }

    return (
        <div className="App">
            <Button onClick={resetPictures}>Reset pictures</Button>
            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures &&
                <Grid container >
                    <Grid item xs={9}>
                        <DayGrid pictures={pictures} test />
                    </Grid>
                    <Grid item xs={3}>
                        <DateCalendar value={dayjs(context.date)} onChange={handleCalendarChange} defaultValue={dayjs("2023-12-01")} maxDate={dayjs("2023-12-24")} minDate={dayjs('2023-12-01')} views={["day"]} />
                    </Grid>
                </Grid>}
        </div>
    )
}