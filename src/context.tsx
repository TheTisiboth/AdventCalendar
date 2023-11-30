import { createContext, Dispatch, FC, SetStateAction, useState } from "react"
import { DBUser, User } from "./types/types"
import dayjs from "dayjs"

enum Role {
    ADMIN = 'admin',
    GUEST = 'guest',
    USER = 'user'
}


const dummyUser: User = {
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
    setIsStarted: Dispatch<SetStateAction<boolean>>
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
    isFake: false,
    setIsFake: () => { },
    startingDate: new Date('December 01, 2023 00:00:00'),
    isStarted: false,
    setIsStarted: () => { },
}

export const GlobalContext = createContext(defaultContext);

type Props = {
    children: React.ReactNode
}
export const MyProvider: FC<Props> = ({ children }) => {
    const [user, setUser] = useState(dummyUser);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [date, setDate] = useState(new Date());
    const [isFake, setIsFake] = useState(false);
    const startingDate = new Date('December 01, 2023 00:00:00');
    // const startingDate = new Date('November 30, 2023 17:34:00');

    const [isStarted, setIsStarted] = useState(dayjs(new Date()).isAfter(startingDate))

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
                setIsStarted
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}
