import { useEffect, useState } from 'react';
import { ONE_DAY_MS, ONE_HOUR_MS, ONE_MINUTE_MS, ONE_SECOND_MS } from '../constants';

const useCountdown = (targetDate: Date) => {
    const countDownDate = targetDate.getTime();

    const [countDown, setCountDown] = useState(
        countDownDate - new Date().getTime()
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime());
        }, 1000);

        return () => clearInterval(interval);
    }, [countDownDate]);

    return getTimeLeft(countDown);
};

const getTimeLeft = (countDown: number) => {
    const days = Math.floor(countDown / (ONE_DAY_MS));
    const hours = Math.floor(
        (countDown % (ONE_DAY_MS)) / (ONE_HOUR_MS)
    );
    const minutes = Math.floor((countDown % (ONE_HOUR_MS)) / (ONE_MINUTE_MS));
    const seconds = Math.floor((countDown % (ONE_MINUTE_MS)) / ONE_SECOND_MS);

    return [days, hours, minutes, seconds];
};

export { useCountdown };
