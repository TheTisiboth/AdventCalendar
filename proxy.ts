import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"

// in the admin routes, user needs to be authenticated
export default withAuth({
    isReturnToCurrentPage: true,
    loginPage: "/api/auth/login",
    isAuthorized: ({ token }: { token: { permissions: string[] } }) => {
        // the user needs specific permission to access admin route
        return token?.permissions?.includes("admin:access")
    }
})

// admin routes
export const config = {
    matcher: ["/calendar/:path*", "/archive/:path*", "/admin/:path*"]
}
