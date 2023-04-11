import { Schema, model } from "mongoose"
import { Picture, Token } from "../../src/types/types"

const pictureSchema = new Schema<Picture>({
    day: Number,
    key: String,
    isOpenable: Boolean,
    isOpen: Boolean,
    date: Date
})

const refreshTokenSchema = new Schema<Token>({
    token: String
})

export const dummyPictureModel = model<Picture>("Picture", pictureSchema, process.env.MONGODB_DUMMY_PICTURES_COLLECTION)
export const pictureModel = model<Picture>("Picture", pictureSchema, process.env.MONGODB_PICTURES_COLLECTION)
export const refreshTokenModel = model<Token>("Token", refreshTokenSchema, "refreshTokens")