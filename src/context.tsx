import { createContext, Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { User } from "./types/types"
import dayjs from "dayjs"
import { useScreenSize } from "./hooks/useScreenSize"
import { useLocalStorage } from "@uidotdev/usehooks"
import { useAPI } from "./hooks/useAPI"
import { useLocation } from "react-router-dom"
import { useNavigate } from "@tanstack/react-router"

enum Role {
    ADMIN = 'admin',
    GUEST = 'guest',
    USER = 'user'
}

export const dummyUser: User = {
    id: '1',
    name: 'dummy',
    role: Role.GUEST
}

type Context = {
    isLoggedIn: boolean,
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>,
    user: User | null,
    setUser: Dispatch<SetStateAction<User>>,
    authorized: boolean,
    setAuthorized: Dispatch<SetStateAction<boolean>>,
    date: Date,
    setDate: Dispatch<SetStateAction<Date>>,
    isFake: boolean
    setIsFake: Dispatch<SetStateAction<boolean>>,
    startingDate: Date,
    isStarted: boolean,
    setIsStarted: Dispatch<SetStateAction<boolean>>,
    isMobile: boolean,
    imageSize: string,
    jwt: string,
    setJWT: Dispatch<SetStateAction<string>>
}

const defaultContext: Context = {
    isLoggedIn: false,
    setIsLoggedIn: () => { },
    user: null,
    setUser: () => { },
    authorized: false,
    setAuthorized: () => { },
    date: new Date(),
    setDate: () => { },
    isFake: true,
    setIsFake: () => { },
    startingDate: new Date('December 01, 2023 00:00:00'),
    isStarted: false,
    setIsStarted: () => { },
    imageSize: "",
    isMobile: false,
    jwt: "",
    setJWT: () => { }
}

export const GlobalContext = createContext(defaultContext);

type Props = {
    children: React.ReactNode
}
export const MyProvider: FC<Props> = ({ children }) => {
    const { authenticate } = useAPI()
    const [user, setUser] = useState(dummyUser);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwt, setJWT] = useState<string>(localStorage.getItem("jwt") || "")
    const [authorized, setAuthorized] = useState(false);
    const [date, setDate] = useState(new Date());
    const [isFake, setIsFake] = useState(true);
    const startingDate = new Date('December 01, 2023 00:00:00');

    const authentication = async () => {
        if (jwt !== "" && !authorized) {
            try {
                const res = await authenticate()
                if (res.ok) {
                    setAuthorized(true)
                }
                else {
                    setJWT("")
                    localStorage.removeItem("jwt")
                }
            } catch (e) {
                setJWT("")
                localStorage.removeItem("jwt")
            }
        }
    }
    useEffect(() => {
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
                authorized,
                setAuthorized,
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
