import { FC, useEffect, useState } from "react";
import { CountdownTimer } from "./CountdownTimer/CountdownTimer";
import { Box } from "@mui/material";

export const Home: FC = () => {
    const date = new Date('December 01, 2023 00:00:00');
    const dateTest = new Date('November 30, 2023 14:47:00');


    return <Box
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 10
        }}>
        <CountdownTimer targetDate={date} />
    </Box >
}