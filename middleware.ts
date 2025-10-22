import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"
import { NextRequest } from "next/server"

export default withAuth(
    async function middleware(req: NextRequest) {
        // Middleware logic runs after authentication is verified
        return undefined
    },
    {
        isReturnToCurrentPage: true,
        // Protect these routes - user must be authenticated to access
        loginPage: "/api/auth/login",
        isAuthorized: ({ token }: { token: unknown }) => {
            // Allow access if user has a valid token
            return token !== null
        }
    }
)

export const config = {
    matcher: [
        // Protected routes - require authentication
        // Note: These routes are also protected by layout safeguards
        // Middleware provides initial auth check, layouts enforce additional rules
        "/calendar/:path*",
        "/archive/:path*",
        "/admin/:path*"
    ]
}
