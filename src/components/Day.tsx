import { Button, Box } from "@mui/material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FC } from "react"
import { NETLIFY_FUNCTIONS_PATH } from "../constants"
import { Picture } from "../types/types"

type DayProps = {
    picture: Picture
}
export const Day: FC<DayProps> = ({ picture }) => {

    const queryClient = useQueryClient();

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
        <Button fullWidth style={{ height: "100%" }} onClick={handleClick}>
            {picture.isOpen &&
                <img src={"/" + picture.key} width={"100%"} />}
            {!picture.isOpen && <Box><p >{picture.day}</p></Box>}
        </Button>
    )
}
