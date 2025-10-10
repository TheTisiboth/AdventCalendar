"use client"

import { FC } from "react"
import { CountdownTimer } from "./CountdownTimer/CountdownTimer"
import { Box } from "@mui/material"
import { useCalendarStore } from "@/store"

export const Home: FC = () => {
    const { startingDate } = useCalendarStore("startingDate")

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(0.5rem, 2vw, 2rem)",
                width: "100%",
                boxSizing: "border-box"
            }}
        >
            <CountdownTimer targetDate={startingDate} />
        </Box>
    )
}
