import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"

// in the protected routes, user needs to be authenticated
export default withAuth({
    isReturnToCurrentPage: true,
    loginPage: "/api/auth/login",
    isAuthorized: ({ token }: { token: { permissions: string[] } }) => {
        // the user needs specific permission to access protected route
        // for now, we just check if the user is authenticated
        return true
    }
})

// admin routes
export const config = {
    matcher: ["/calendar/:path*", "/archive/:path*", "/admin/:path*"]
}
