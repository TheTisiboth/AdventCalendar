import { Button } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FC, useState } from "react"
import { NETLIFY_FUNCTIONS_PATH } from "../constants"
import { Picture } from "../types/types"
import { DayGrid } from "./Grid"

export const Home: FC = () => {
    const queryClient = useQueryClient();

    const resetPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "reset_pictures")
        queryClient.invalidateQueries({ queryKey: ["pictures"] });

    }

    const fetchComments = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "get_comments")
        return response.json()
    }

    const fetchPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "get_pictures")
        return response.json()
    }

    const { data: pictures, isLoading: isPictureLoading } = useQuery<Picture[]>({ queryKey: ["pictures"], queryFn: fetchPictures })
    console.log(pictures)
    return (
        <div className="App">
            <Button onClick={resetPictures}>Reset pictures</Button>
            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures && <DayGrid pictures={pictures} />}

        </div>
    )
}