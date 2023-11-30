import { FC, useEffect, useState } from "react";
import { CountdownTimer } from "./CountdownTimer/CountdownTimer";

export const Home: FC = () => {
    const date = new Date('December 01, 2023 00:00:00');
    const dateTest = new Date('November 30, 2023 14:47:00');


    return <div>
        Home
        <div>
            <CountdownTimer targetDate={dateTest} />
        </div>
    </div>
}