"use client"

import { FC } from "react"
import { CountdownTimer } from "./CountdownTimer/CountdownTimer"
import { Box } from "@mui/material"
import { useCalendarStore } from "../store"

export const Home: FC = () => {
    const { startingDate } = useCalendarStore("startingDate")

    return (
        <Box
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 10
            }}
        >
            <CountdownTimer targetDate={startingDate} />
        </Box>
    )
}
