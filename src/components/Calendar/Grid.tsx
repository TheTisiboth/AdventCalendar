import { FC } from "react"
import type { Picture } from "@prisma/client"
import Grid from "@mui/material/Grid"
import { Day } from "./Day"
import { shuffle } from "@/utils/utils"
import { useCalendarStore } from "@/store"

type DayGridProps = {
    pictures: Picture[]
}
export const DayGrid: FC<DayGridProps> = ({ pictures }) => {
    const { date } = useCalendarStore("date")
    const year = date.getFullYear() // Seed the shuffle with the current year
    return (
        <Grid container spacing={2}>
            {shuffle(pictures, year).map((pic) => (
                <Grid item xs={3} lg={2} key={pic.id}>
                    <Day picture={pic} />
                </Grid>
            ))}
        </Grid>
    )
}
