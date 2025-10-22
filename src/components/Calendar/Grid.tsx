import { FC } from "react"
import type { PictureWithUrl } from "@actions/pictures"
import Grid from "@mui/material/Grid"
import { Day } from "./Day"
import { shuffle } from "@/utils/utils"
import { useCalendarStore } from "@/store"

type DayGridProps = {
    pictures: PictureWithUrl[]
    isArchived?: boolean
    isFakeMode?: boolean
}
export const DayGrid: FC<DayGridProps> = ({ pictures, isArchived = false, isFakeMode = false }) => {
    const { date } = useCalendarStore("date")
    const year = date.getFullYear() // Seed the shuffle with the current year
    return (
        <Grid container spacing={2}>
            {shuffle(pictures, year).map((pic) => (
                <Grid size={{ xs: 3, lg: 2 }} key={pic.id}>
                    <Day picture={pic} isArchived={isArchived} isFakeMode={isFakeMode} />
                </Grid>
            ))}
        </Grid>
    )
}
