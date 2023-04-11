import { Types } from "mongoose"

export interface Picture {
    _id: Types.ObjectId,
    day: number,
    key: string,
    isOpenable: boolean,
    isOpen: boolean,
    date: Date
}

export type Credentials = {
    userName: string,
    password: string,
}

export type User = {
    name: string,
}

export type Token = {
    token: string,
}