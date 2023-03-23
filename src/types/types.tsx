import { Types } from "mongoose"

export interface Picture {
    _id: Types.ObjectId,
    day: number,
    key: string,
    isOpenable: boolean,
    isOpen: boolean,
    date: Date
}