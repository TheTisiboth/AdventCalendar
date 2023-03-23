import { Button, Box } from "@mui/material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { FC, useContext } from "react"
import { CDN_URL, NETLIFY_FUNCTIONS_PATH } from "../constants"
import { GlobalContext } from "../context"
import { Picture } from "../types/types"

type DayProps = {
    picture: Picture
}
export const Day: FC<DayProps> = ({ picture }) => {

    const queryClient = useQueryClient();
    const { date } = useContext(GlobalContext)
    const isBefore = dayjs(date).isBefore(dayjs(picture.date))

    const openPicture = async (day: number) => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "open_picture?" + new URLSearchParams({
            day: day.toString()
        }))
        return response.json()
    }

    const { status, error, mutate, data } = useMutation(openPicture, {
        onSuccess: () => {
            console.log("mutate OK")
            queryClient.invalidateQueries({ queryKey: ["pictures"] });
        }
    });

    const handleClick = () => {
        if (!picture.isOpen) {
            console.log("mutate", picture)
            mutate(picture.day)
        }
    }

    return (
        <Button disabled={isBefore} fullWidth style={{ height: "100%" }} onClick={handleClick}>
            {!isBefore && picture.isOpen &&
                <img src={CDN_URL + picture.key} width={"100%"} />}
            {(!picture.isOpen || isBefore) && <Box><p >{picture.day}</p></Box>}
        </Button>
    )
}
