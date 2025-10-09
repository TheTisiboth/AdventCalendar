import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { findUserByName, createRefreshToken } from "../lib/dal"
import { generateAccessToken, generateRefreshToken } from "../lib/auth"
import { User, Credentials } from "@/types/types"

export async function POST(request: NextRequest) {
    try {
        const body: Credentials = await request.json()
        const { name, password } = body

        const DBUser = await findUserByName(name)

        if (DBUser) {
            const isPasswordCorrect = bcrypt.compareSync(password, DBUser.password)
            if (isPasswordCorrect) {
                const user: User = { name: DBUser.name, id: DBUser.id.toString(), role: DBUser.role }
                const accessToken = generateAccessToken(user)
                const refreshToken = generateRefreshToken(user)

                // Store refresh token
                await createRefreshToken(refreshToken)

                return NextResponse.json({ user, accessToken, refreshToken })
            }
        }

        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
