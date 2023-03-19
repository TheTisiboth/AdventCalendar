import { Schema, model } from "mongoose"
import { Comment } from "../../src/types/types"

const commentSchema = new Schema<Comment>({
    name: String,
    email: String,
    movie_id: Number,
    text: String,
    date: Date
})

export const commentModel = model<Comment>(process.env.MONGODB_COLLECTION!, commentSchema)
