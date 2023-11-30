import { Button, Box, Paper } from "@mui/material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { FC, useContext, useRef } from "react"
import { CDN_URL, NETLIFY_FUNCTIONS_PATH } from "../constants"
import { GlobalContext } from "../context"
import { Picture } from "../types/types"
import './Day.css'

type DayProps = {
    picture: Picture,
    test: boolean
}
export const Day: FC<DayProps> = ({ picture, test }) => {

    const queryClient = useQueryClient();
    const { date } = useContext(GlobalContext)
    const isBefore = dayjs(date).isBefore(dayjs(picture.date))
    const imageRef = useRef<HTMLImageElement>(null)
    const isToday = dayjs(date).isSame(dayjs(picture.date), "day")
    if (picture.day === 1) {
        console.log(picture)
        console.log(isBefore)
    }
    const openPicture = async (day: number) => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "open_picture?" + new URLSearchParams({
            day: day.toString()
        }), {
            method: "POST", body: JSON.stringify({ test })
        })
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

    const onClick = () => {
        imageRef.current?.requestFullscreen();
    }

    return (
        <Button disabled={isBefore} fullWidth style={{ height: "200px", width: "100%" }} onClick={handleClick} >
            {!isBefore && picture.isOpen &&
                <div className="image-container">
                    <img ref={imageRef} onClick={onClick} src={CDN_URL + picture.key} width={"100%"} height={"100%"} className="image" />
                    <div className="text-overlay">{picture.day}</div>
                </div>
            }
            {(!picture.isOpen || isBefore) && <Paper elevation={10} style={{ width: "100%", height: "100%", backgroundColor: `${isBefore ? "white" : "blue"}`, color: `${isBefore ? "blue" : "white"}` }} >{picture.day}</Paper>}
        </Button >
    )
}
