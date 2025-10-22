import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server"

// Enable dynamic rendering for auth routes
export const dynamic = 'force-dynamic'

export const GET = handleAuth()
