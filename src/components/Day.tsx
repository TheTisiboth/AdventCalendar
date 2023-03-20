import { Button } from "@mui/material"
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
        console.log("openPicture", day)
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "open_picture?" + new URLSearchParams({
            day: day.toString()
        }))
        return response.json()
    }

    const { status, error, mutate, data } = useMutation(openPicture, {
        onSuccess: () => {
            console.log("OK")
            queryClient.invalidateQueries({ queryKey: ["pictures"] });
        }
    });

    console.log("data", data)
    console.log("picture", picture)


    const handleClick = () => {
        if (!picture.isOpen) {
            console.log("mutate", picture)
            mutate(picture.day)
        }
    }

    return (
        <Button onClick={handleClick}>
            {picture.isOpen &&
                <img src={picture.content} width={"100%"} />}
            {!picture.isOpen && <p>{picture.day}</p>}
        </Button>
    )
}
