import { FC } from "react"
import { Picture } from "../types/types"
import Grid from '@mui/material/Grid';
import { Day } from "./Day";

type DayGridProps = {
    pictures: Picture[],
}
export const DayGrid: FC<DayGridProps> = ({ pictures }) => {
    return (
        <Grid container spacing={2}>
            {pictures.map(pic => (
                <Grid item xs={2} key={pic._id.toString()}>
                    <Day picture={pic} />
                </Grid>
            ))}
        </Grid>
    )
}