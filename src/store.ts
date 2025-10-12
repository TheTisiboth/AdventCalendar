import { User } from "./types/types"
import { AlertColor } from "@mui/material"
import { StoreApi, UseBoundStore, create } from "zustand"
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
    handleClose: () => void
    severity: AlertColor
}

enum Role {
    ADMIN = "admin",
    GUEST = "guest",
    USER = "user"
}

export const dummyUser: User = {
    id: 1,
    name: "dummy",
    role: Role.GUEST
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
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 992 : false
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

export const useResponsiveStore = (...items: Array<keyof ResponsiveStore>) =>
    useMulti(responsiveStore, ...items)

const authStore = create<AuthStore>()((set) => {
    // Load user from localStorage on initialization
    let initialUser = dummyUser
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                initialUser = JSON.parse(storedUser)
            } catch (e) {
                console.error("Failed to parse stored user:", e)
            }
        }
    }

    return {
        isLoggedIn: false,
        jwt: typeof window !== 'undefined' ? localStorage.getItem("jwt") || "" : "",
        user: initialUser,
        setIsLoggedIn: (isLoggedIn) => {
            set({ isLoggedIn })
        },
        setJWT: (jwt) => {
            set({ jwt })
        },
        setUser: (user) => {
            set({ user })
            // Persist user to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem("user", JSON.stringify(user))
            }
        }
    }
})

export const useAuthStore = (...items: Array<keyof AuthStore>) => useMulti(authStore, ...items)

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
    useStoreFn((state) =>
        Object.fromEntries(items.map((item) => [item, state[item]])) as Pick<T, K>
    )
