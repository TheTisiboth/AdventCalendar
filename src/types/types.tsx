export type Picture = {
    id: number
    day: number
    key: string
    isOpenable: boolean
    isOpen: boolean
    date: Date
}

export type Credentials = {
    name: string
    password: string
}

export type DBUser = {
    id: string
    name: string
    role: string
    password: string
}

export type User = {
    id: string
    name: string
    role: string
}

export type Token = {
    token: string
}

export type LoginResponse = { user: User; accessToken: string; refreshToken: string }
