import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import { User } from "@/types/types"

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("Missing JWT secrets in environment variables")
}

export const checkAuth = (request: NextRequest): Promise<string> => {
    return new Promise((resolve, reject) => {
        const authHeader = request.headers.get("authorization")
        if (!authHeader) {
            return reject(new Error("Missing authorization header. You must be signed in to call this function"))
        }
        // remove "bearer " word from token
        const authToken = authHeader.substring(7)
        jwt.verify(authToken, ACCESS_TOKEN_SECRET, (err) => {
            if (err) return reject(err)
            else return resolve(authToken)
        })
    })
}

export const generateAccessToken = (user: User) => {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "24d" })
}

export const generateRefreshToken = (user: User) => {
    return jwt.sign(user, REFRESH_TOKEN_SECRET)
}

export const verifyRefreshToken = (token: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return reject(err)
            else return resolve(user as User)
        })
    })
}

export const checkAdminAuth = async (request: NextRequest): Promise<User> => {
    return new Promise((resolve, reject) => {
        const authHeader = request.headers.get("authorization")
        if (!authHeader) {
            return reject(new Error("Missing authorization header"))
        }
        const authToken = authHeader.substring(7)
        jwt.verify(authToken, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return reject(err)
            const userData = user as User
            if (userData.role !== 'admin') {
                return reject(new Error("Unauthorized: Admin access required"))
            }
            return resolve(userData)
        })
    })
}
