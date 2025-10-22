import { redirect } from "next/navigation"
import { requireKindeAuth, requireKindeAdmin, getKindeUser, isKindeAdmin } from "@api/lib/kindeAuth"

/**
 * Safeguard: Require authentication for a page
 * Redirects to login if not authenticated
 * Returns the authenticated user
 */
export async function requireAuth() {
    try {
        return await requireKindeAuth()
    } catch {
        redirect("/api/auth/login")
    }
}

/**
 * Safeguard: Require admin access for a page
 * Redirects to home if not authenticated or not admin
 * Returns the authenticated admin user
 */
export async function requireAdmin() {
    try {
        return await requireKindeAdmin()
    } catch {
        redirect("/")
    }
}

/**
 * Safeguard: Get current user (optional auth)
 * Returns user or null if not authenticated
 * Does not redirect
 */
export async function getCurrentUser() {
    return await getKindeUser()
}

/**
 * Safeguard: Check if current user is admin
 * Returns boolean indicating admin status
 */
export async function checkIsAdmin() {
    const user = await getKindeUser()
    if (!user) return false
    return await isKindeAdmin()
}
