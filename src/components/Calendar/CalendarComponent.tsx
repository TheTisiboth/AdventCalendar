import { FC, useContext, useEffect } from "react"
import { GlobalContext } from "../../context"
import { Button } from "@mui/material";
import Grid from '@mui/system/Unstable_Grid';
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DayGrid } from "./Grid";
import { useAPI } from "../../hooks/useAPI";

type CalendarComponentProps = {
    test: boolean,
}
export const CalendarComponent: FC<CalendarComponentProps> = ({ test }) => {
    const { setIsFake, setDate, date } = useContext(GlobalContext)
    const { resetPictures, fetchPictures: { isPictureLoading, pictures } } = useAPI()

    useEffect(() => {
        setDate(new Date())
        setIsFake(test)
    }, [])

    const handleCalendarChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            setDate(date.toDate())
        }
    }

    return (
        <div className="App">
            {test &&
                <Button variant="contained" color="error" onClick={resetPictures}>Reset pictures</Button>
            }
            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures &&
                <Grid container >
                    {!test &&
                        <Grid xs={12}>
                            <DayGrid pictures={pictures} />
                        </Grid>
                    }
                    {test &&
                        <>
                            <Grid lg={2}>
                                <Grid xs={11} sm={12}>You can simulate todays date with the calendar component. You can also see a representation of an advent calendar that has some closed, ready to be open and opened pictures. A white rectange is a day in the future: you can't interact with it. A blue rectangle is a day in the past, or today: they are ready to be opened. You can interact wiht it by clicking on it: it will open the corresponding picture. You can reset the opened pictures, by clicking on the rest pictures button, on the top left hand side.</Grid>
                                <Grid sm={12}>
                                    <DateCalendar value={dayjs(date)} onChange={handleCalendarChange} defaultValue={dayjs("2023-12-01")} maxDate={dayjs("2023-12-24")} minDate={dayjs('2023-12-01')} views={["day"]} />
                                </Grid>
                            </Grid>
                            <Grid xs={10} lg={9} xsOffset={1}>
                                <DayGrid pictures={pictures} />
                            </Grid>
                        </>
                    }
                </Grid>}
        </div>
    )
}

export default CalendarComponent