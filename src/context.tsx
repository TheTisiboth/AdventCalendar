import { createContext, Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { User } from "./types/types"
import dayjs from "dayjs"
import { useScreenSize } from "./hooks/useScreenSize"
import { useAPI } from "./hooks/useAPI"

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

type Context = {
    isLoggedIn: boolean
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>
    user: User | null
    setUser: Dispatch<SetStateAction<User>>
    date: Date
    setDate: Dispatch<SetStateAction<Date>>
    isFake: boolean
    setIsFake: Dispatch<SetStateAction<boolean>>
    startingDate: Date
    isStarted: boolean
    setIsStarted: Dispatch<SetStateAction<boolean>>
    isMobile: boolean
    imageSize: string
    jwt: string
    setJWT: Dispatch<SetStateAction<string>>
}

const defaultContext: Context = {
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    user: null,
    setUser: () => {},
    date: new Date(),
    setDate: () => {},
    isFake: true,
    setIsFake: () => {},
    startingDate: new Date("December 01, 2023 00:00:00"),
    isStarted: false,
    setIsStarted: () => {},
    imageSize: "",
    isMobile: false,
    jwt: "",
    setJWT: () => {}
}

export const GlobalContext = createContext(defaultContext)

type Props = {
    children: React.ReactNode
}
export const MyProvider: FC<Props> = ({ children }) => {
    const { authenticate } = useAPI()
    const [user, setUser] = useState(dummyUser)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [jwt, setJWT] = useState<string>(localStorage.getItem("jwt") || "")
    const [date, setDate] = useState(new Date())
    const [isFake, setIsFake] = useState(true)
    const startingDate = new Date("December 01, 2023 00:00:00")

    useEffect(() => {
        const authentication = async () => {
            if (jwt !== "" && !isLoggedIn) {
                try {
                    await authenticate()
                    setIsLoggedIn(true)
                } catch (e) {
                    setJWT("")
                    localStorage.removeItem("jwt")
                }
            }
        }
        authentication()
    }, [])

    // const startingDate = new Date('November 30, 2023 17:34:00');

    const [isStarted, setIsStarted] = useState(dayjs(new Date()).isAfter(startingDate))
    const { imageSize, isMobile } = useScreenSize()

    return (
        <GlobalContext.Provider
            value={{
                user,
                setUser,
                isLoggedIn,
                setIsLoggedIn,
                date,
                setDate,
                isFake,
                setIsFake,
                startingDate,
                isStarted,
                setIsStarted,
                isMobile,
                imageSize,
                jwt,
                setJWT
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}
