import { Schema, model } from "mongoose"
import { Picture } from "../../src/types/types"

const pictureSchema = new Schema<Picture>({
    day: Number,
    key: String,
    isOpenable: Boolean,
    isOpen: Boolean
})

export const dummyPictureModel = model<Picture>("Picture", pictureSchema, process.env.MONGODB_DUMMY_PICTURES_COLLECTION)
export const pictureModel = model<Picture>("Picture", pictureSchema, process.env.MONGODB_PICTURES_COLLECTION)
