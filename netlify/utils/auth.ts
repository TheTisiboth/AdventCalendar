import { Event } from '@netlify/functions/dist/function/event'
import jwt from 'jsonwebtoken'

/* Check authorization JWT */
export const checkAuth = (event: Event) => {
    return new Promise((resolve, reject) => {
        // Handler auth headers 
        const authHeader = event.headers.authorization
        if (!authHeader) {
            const reason = 'Missing event.headers.authorization. You must be signed in to call this function'
            return reject(new Error(reason))
        }
        // remove "bearer " word from token
        const authToken = authHeader.substring(7)

        jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
            if (err) return reject(err)
            else return resolve(user)
        })
    })
}