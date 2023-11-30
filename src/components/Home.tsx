import { FC, useContext, useEffect, useState } from "react";
import { CountdownTimer } from "./CountdownTimer/CountdownTimer";
import { Box } from "@mui/material";
import { GlobalContext } from "../context";

export const Home: FC = () => {
    const { startingDate } = useContext(GlobalContext)


    return <Box
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 10
        }}>
        <CountdownTimer targetDate={startingDate} />
    </Box >
}