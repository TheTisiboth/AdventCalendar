import { FC, useEffect } from "react"
import { Button } from "@mui/material"
import Grid from "@mui/system/Unstable_Grid"
import { DateCalendar } from "@mui/x-date-pickers"
import dayjs from "dayjs"
import { DayGrid } from "./Grid"
import { useAPI } from "../../hooks/useAPI"
import { BackdropSpinner } from "./Backdrop"
import { useCalendarStoreMulti } from "../../store"

export const CalendarComponent: FC = () => {
    const { setDate, date, isFake, startingDate, endingDate } = useCalendarStoreMulti(
        "date",
        "setDate",
        "isFake",
        "startingDate",
        "endingDate"
    )
    const {
        resetPictures,
        fetchPictures: { isPictureLoading, pictures }
    } = useAPI()

    const handleCalendarChange = (date: dayjs.Dayjs | null) => {
        if (date) setDate(date.toDate())
    }

    return (
        <div className="App">
            {isFake && (
                <Button variant="contained" color="error" onClick={resetPictures}>
                    Reset pictures
                </Button>
            )}
            {isPictureLoading && <BackdropSpinner />}
            {!isPictureLoading && pictures && (
                <Grid container>
                    {!isFake && (
                        <Grid xs={12}>
                            <DayGrid pictures={pictures} />
                        </Grid>
                    )}
                    {isFake && (
                        <>
                            <Grid lg={2}>
                                <Grid xs={11} sm={12}>
                                    You can simulate todays date with the calendar component. You can also see a
                                    representation of an advent calendar that has some closed, ready to be open and
                                    opened pictures. A white rectange is a day in the future: you can&apos;t interact
                                    with it. A blue rectangle is a day in the past, or today: they are ready to be
                                    opened. You can interact wiht it by clicking on it: it will open the corresponding
                                    picture. You can reset the opened pictures, by clicking on the rest pictures button,
                                    on the top left hand side.
                                </Grid>
                                <Grid sm={12}>
                                    <DateCalendar
                                        value={dayjs(date)}
                                        onChange={handleCalendarChange}
                                        defaultValue={dayjs(startingDate)}
                                        maxDate={dayjs(endingDate)}
                                        minDate={dayjs(startingDate)}
                                        views={["day"]}
                                    />
                                </Grid>
                            </Grid>
                            <Grid xs={10} lg={9} xsOffset={1}>
                                <DayGrid pictures={pictures} />
                            </Grid>
                        </>
                    )}
                </Grid>
            )}
        </div>
    )
}

export default CalendarComponent
