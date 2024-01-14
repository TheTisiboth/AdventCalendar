import { FC } from "react"
import { Picture } from "../../types/types"
import Grid from "@mui/material/Grid"
import { Day } from "./Day"
import { shuffle } from "../../utils/utils"
import { useCalendarStoreMulti } from "../../store"

type DayGridProps = {
    pictures: Picture[]
}
export const DayGrid: FC<DayGridProps> = ({ pictures }) => {
    const { date } = useCalendarStoreMulti("date")
    const year = date.getFullYear() // Seed the shuffle with the current year
    return (
        <Grid container spacing={2}>
            {shuffle(pictures, year).map((pic) => (
                <Grid item xs={3} lg={2} key={pic._id.toString()}>
                    <Day picture={pic} />
                </Grid>
            ))}
        </Grid>
    )
}
