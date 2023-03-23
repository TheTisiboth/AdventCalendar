import { createContext, Dispatch, FC, SetStateAction, useState } from "react"

enum Role {
    ADMIN = 'admin',
    GUEST = 'guest',
    USER = 'user'
}

type User = {
    id: string,
    name: string,
    role: string
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
    setIsFake: Dispatch<SetStateAction<boolean>>
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
    setIsFake: () => { }
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
                setIsFake
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}
