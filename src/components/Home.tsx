"use client"

import { FC } from "react"
import dynamic from "next/dynamic"
import { Box } from "@mui/material"
import { useCalendarStore } from "@/store"

// Import CountdownTimer without SSR to prevent hydration mismatch
const CountdownTimer = dynamic(
    () => import("./CountdownTimer/CountdownTimer").then((mod) => ({ default: mod.CountdownTimer })),
    { ssr: false }
)

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
