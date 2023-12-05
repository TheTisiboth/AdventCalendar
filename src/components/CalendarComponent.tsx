import { FC, useContext, useEffect } from "react"
import { GlobalContext } from "../context"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Grid } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { NETLIFY_FUNCTIONS_PATH } from "../constants";
import { Picture } from "../types/types";
import { DayGrid } from "./Grid";

type CalendarComponentProps = {
    test: boolean,
    resetPictures?: () => void
}
export const CalendarComponent: FC<CalendarComponentProps> = ({ test, resetPictures }) => {
    const context = useContext(GlobalContext)

    useEffect(() => {
        console.log("ctx", context.date)

    }, [context])

    useEffect(() => {
        console.log("CalendarComponent update")
        console.log(test)

    })

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

    const handleCalendarChange = (date: dayjs.Dayjs | null) => {
        console.log("date", date?.toDate())
        if (date) {
            context.setDate(date.toDate())
        }
    }

    const { data: pictures, isLoading: isPictureLoading, } = useQuery<Picture[]>({ queryKey: ["pictures"], queryFn: fetchPictures })

    return (
        <div className="App">
            {test &&
                <Button onClick={resetPictures}>Reset pictures</Button>
            }
            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures &&
                <Grid container >
                    {/* <Grid item xs={1} /> */}
                    {!test &&
                        <Grid item xs={12}>
                            <DayGrid pictures={pictures} test />
                        </Grid>
                    }
                    {test &&
                        <>
                            <Grid item sm={3}>
                                <Grid item xs={11} sm={12}>You can simulate todays date with the calendar component. You can also see a representation of an advent calendar that has some closed, ready to be open and opened pictures. A white rectange is a day in the future: you can't interact with it. A blue rectangle is a day in the past, or today: they are ready to be opened. You can interact wiht it by clicking on it: it will open the corresponding picture. You can reset the opened pictures, by clicking on the rest pictures button, on the top left hand side.</Grid>
                                <Grid item sm={12}>
                                    <DateCalendar value={dayjs(context.date)} onChange={handleCalendarChange} defaultValue={dayjs("2023-12-01")} maxDate={dayjs("2023-12-24")} minDate={dayjs('2023-12-01')} views={["day"]} />
                                </Grid>
                            </Grid>
                            <Grid item xs={10} sm={9}>
                                <DayGrid pictures={pictures} test={true} />
                            </Grid>
                        </>
                    }
                </Grid>}
        </div>
    )
}

export default CalendarComponent