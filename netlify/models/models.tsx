import { Schema, model } from "mongoose"
import { Picture, Token, DBUser } from "../../src/types/types"

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

const userSchema = new Schema<DBUser>({
    name: String,
    role: String,
    password: String
})

export const dummyPictureModel = model<Picture>("Picture", pictureSchema, process.env.MONGODB_DUMMY_PICTURES_COLLECTION)
export const pictureModel = model<Picture>("Picture", pictureSchema, process.env.MONGODB_PICTURES_COLLECTION)
export const refreshTokenModel = model<Token>("Token", refreshTokenSchema, "refreshTokens")
export const userModel = model<DBUser>("User", userSchema, "users")