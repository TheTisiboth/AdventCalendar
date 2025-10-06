import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { userModel } from "../lib/models"
import { generateAccessToken, generateRefreshToken } from "../lib/auth"
import { User, Credentials } from "@/types/types"
import connectDB from "../lib/mongodb"

export async function POST(request: NextRequest) {
    try {
        const body: Credentials = await request.json()
        const { name, password } = body

        await connectDB()
        const DBUser = await userModel.findOne({ name }).exec()

        if (DBUser) {
            const isPasswordCorrect = bcrypt.compareSync(password, DBUser.password)
            if (isPasswordCorrect) {
                const user: User = { name: DBUser.name, id: DBUser._id.toString(), role: DBUser.role }
                const accessToken = generateAccessToken(user)
                const refreshToken = generateRefreshToken(user)
                return NextResponse.json({ user, accessToken, refreshToken })
            }
        }

        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
