"use client"

import { FC } from "react"
import { Button } from "@mui/material"
import Grid from "@mui/material/Grid"
import { DateCalendar } from "@mui/x-date-pickers"
import dayjs from "dayjs"
import { DayGrid } from "./Grid"
import type { PictureWithUrl } from "@actions/pictures"
import { useCalendarStore } from "@/store"
import { resetPictures } from "@actions/pictures"
import { useSnackBarStore } from "@/store"

type CalendarComponentProps = {
    pictures: PictureWithUrl[]
    year: number
    isArchived?: boolean
}

export const CalendarComponent: FC<CalendarComponentProps> = ({ pictures, year, isArchived = false }) => {
    const { setDate, date, isFake, startingDate, endingDate } = useCalendarStore(
        "date",
        "setDate",
        "isFake",
        "startingDate",
        "endingDate"
    )
    const { handleClick } = useSnackBarStore("handleClick")

    const handleCalendarChange = (date: dayjs.Dayjs | null) => {
        if (date) setDate(date.toDate())
    }

    const handleResetPictures = async () => {
        try {
            await resetPictures(year)
            handleClick("Pictures reset successfully", "success")
        } catch (error) {
            handleClick(error instanceof Error ? error.message : "Failed to reset pictures", "error")
        }
    }

    return (
        <div className="App">
            {isFake && !isArchived && (
                <Button variant="contained" color="error" onClick={handleResetPictures}>
                    Reset pictures
                </Button>
            )}
            <Grid container>
                {(!isFake || isArchived) && (
                    <Grid size={{ xs: 12 }}>
                        <DayGrid pictures={pictures} isArchived={isArchived} />
                    </Grid>
                )}
                {isFake && !isArchived && (
                    <>
                        <Grid size={{ lg: 2 }}>
                            <Grid size={{ xs: 11, sm: 12 }}>
                                You can simulate todays date with the calendar component. You can also see a
                                representation of an advent calendar that has some closed, ready to be open and
                                opened pictures. A white rectange is a day in the future: you can&apos;t interact
                                with it. A blue rectangle is a day in the past, or today: they are ready to be
                                opened. You can interact wiht it by clicking on it: it will open the corresponding
                                picture. You can reset the opened pictures, by clicking on the rest pictures button,
                                on the top left hand side.
                            </Grid>
                            <Grid size={{ sm: 12 }}>
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
                        <Grid size={{ xs: 10, lg: 9 }} offset={{ xs: 1 }}>
                            <DayGrid pictures={pictures} />
                        </Grid>
                    </>
                )}
            </Grid>
        </div>
    )
}

export default CalendarComponent
