import { Schema, model, models } from "mongoose"
import { Picture, Token, DBUser } from "@/types/types"

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

// Use models object to prevent reinitialization during hot reloads
export const dummyPictureModel = models.DummyPicture || model<Picture>("DummyPicture", pictureSchema, process.env.MONGODB_DUMMY_PICTURES_COLLECTION)
export const pictureModel = models.RealPicture || model<Picture>("RealPicture", pictureSchema, process.env.MONGODB_PICTURES_COLLECTION)
export const refreshTokenModel = models.RefreshToken || model<Token>("RefreshToken", refreshTokenSchema, "refreshTokens")
export const userModel = models.User || model<DBUser>("User", userSchema, "users")
