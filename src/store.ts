import { AlertColor } from "@mui/material"
import { StoreApi, UseBoundStore, create } from "zustand"
import { useShallow } from "zustand/shallow"
import { computeStartingAndEndingDate } from "./utils/utils"
import dayjs from "dayjs"

type CalendarStore = {
    date: Date
    setDate: (d: Date) => void
    isFake: boolean
    setIsFake: (f: boolean) => void
    startingDate: Date
    endingDate: Date
    isStarted: () => boolean
    setIsStarted: (s: boolean) => void
}

type ResponsiveStore = {
    isMobile: boolean
    imageSize: string
    setIsMobile: (b: boolean) => void
    setImageSize: (s: string) => void
}

type SnackbarStore = {
    open: boolean
    message: string
    handleClick: (message: string, severity?: AlertColor) => void
    handleClose: () => void
    severity: AlertColor
}

const { startingDate, endingDate } = computeStartingAndEndingDate()

const calendarStore = create<CalendarStore>()((set, get) => ({
    date: new Date(),
    endingDate,
    startingDate,
    isFake: true,
    isStarted: () => dayjs(get().date).isAfter(startingDate),
    setDate: (date) => {
        set({ date })
    },
    setIsFake: (isFake) => {
        set({ isFake })
    },
    setIsStarted: (isStarted) => {
        set({ isStarted: () => isStarted })
    }
}))

export const useCalendarStore = (...items: Array<keyof CalendarStore>) => useMulti(calendarStore, ...items)

const responsiveStore = create<ResponsiveStore>()((set) => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 992 : false
    return {
        imageSize: isMobile ? "5em" : "13em",
        isMobile,
        setIsMobile: (isMobile) => {
            set({ isMobile })
        },
        setImageSize: (imageSize) => {
            set({ imageSize })
        }
    }
})

export const useResponsiveStore = (...items: Array<keyof ResponsiveStore>) => useMulti(responsiveStore, ...items)

const snackbarStore = create<SnackbarStore>()((set) => ({
    message: "",
    open: false,
    severity: "error",
    handleClick: (message: string, severity: AlertColor = "error") => {
        set({ message, severity, open: true })
    },
    handleClose: () => {
        set({ open: false })
    }
}))

export const useSnackBarStore = (...items: Array<keyof SnackbarStore>) => useMulti(snackbarStore, ...items)

/**
 * Retrieve the items from the store
 * @param useStoreFn A store function
 * @param items A list of items to retrieve from the store
 * @returns A list of objects retrieved from the store, according to the provided items
 */
const useMulti = <T extends object, K extends keyof T>(
    useStoreFn: UseBoundStore<StoreApi<T>>,
    ...items: K[]
): Pick<T, K> =>
    useStoreFn(useShallow((state) => Object.fromEntries(items.map((item) => [item, state[item]])) as Pick<T, K>))
