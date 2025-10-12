import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

/**
 * Get the authenticated Kinde user from the session
 * Returns null if not authenticated
 */
export async function getKindeUser() {
    const { getUser, isAuthenticated } = getKindeServerSession()

    if (!(await isAuthenticated())) {
        return null
    }

    return await getUser()
}

/**
 * Check if the user is authenticated with Kinde
 * Throws an error if not authenticated
 */
export async function requireKindeAuth() {
    const user = await getKindeUser()

    if (!user) {
        throw new Error("Authentication required")
    }

    return user
}

/**
 * Check if the user is an admin (for backward compatibility with old auth system)
 * In Kinde, you can set this via permissions/roles
 */
export async function isKindeAdmin() {
    const { getPermission } = getKindeServerSession()
    const adminPermission = await getPermission("admin:access")

    return adminPermission?.isGranted ?? false
}

/**
 * Require admin access
 */
export async function requireKindeAdmin() {
    const user = await requireKindeAuth()
    const isAdmin = await isKindeAdmin()

    if (!isAdmin) {
        throw new Error("Admin access required")
    }

    return user
}
