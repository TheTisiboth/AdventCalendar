import { FC, useContext } from "react"
import { Picture } from "../types/types"
import Grid from '@mui/material/Grid';
import { Day } from "./Day";
import { GlobalContext } from "../context";
import { shuffle } from "../utils/utils";

type DayGridProps = {
    pictures: Picture[],
    test: boolean
}
export const DayGrid: FC<DayGridProps> = ({ pictures, test }) => {
    const { date } = useContext(GlobalContext)
    const year = date.getFullYear() // Seed the shuffle with the current year
    return (
        <Grid container spacing={2}>
            {shuffle(pictures, year).map(pic => (
                <Grid item xs={3} sm={2} key={pic._id.toString()}>
                    <Day picture={pic} test />
                </Grid>
            ))}
        </Grid>
    )
}