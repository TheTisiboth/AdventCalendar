import { User } from "./types/types"
import { AlertColor } from "@mui/material"
import { create } from "zustand"
import { computeStartingANdEndingDate } from "./utils/utils"
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

type AuthStore = {
    isLoggedIn: boolean
    setIsLoggedIn: (i: boolean) => void
    user: User | null
    setUser: (u: User) => void
    jwt: string
    setJWT: (jwt: string) => void
}

type SnackbarStore = {
    open: boolean
    message: string
    handleClick: (message: string, severity?: AlertColor) => void
    handleClose: (_event: Event | React.SyntheticEvent<Element, Event>, reason?: string | undefined) => void
    severity: AlertColor
}

enum Role {
    ADMIN = "admin",
    GUEST = "guest",
    USER = "user"
}

export const dummyUser: User = {
    id: "1",
    name: "dummy",
    role: Role.GUEST
}

const { startingDate, endingDate } = computeStartingANdEndingDate()

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
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

export const useResponsiveStore = create<ResponsiveStore>()((set) => {
    const isMobile = window.innerWidth <= 992
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

export const useAuthStore = create<AuthStore>()((set) => ({
    isLoggedIn: false,
    jwt: localStorage.getItem("jwt") || "",
    user: dummyUser,
    setIsLoggedIn: (isLoggedIn) => {
        set({ isLoggedIn })
    },
    setJWT: (jwt) => {
        set({ jwt })
    },
    setUser: (user) => {
        set({ user })
    }
}))

export const useSnackbarStore = create<SnackbarStore>()((set) => ({
    message: "",
    open: false,
    severity: "error",
    handleClick: (message: string, severity: AlertColor = "error") => {
        set({ message, severity, open: true })
    },
    handleClose: (_event: React.SyntheticEvent | Event, _reason?: string) => {
        set({ open: false })
    }
}))
