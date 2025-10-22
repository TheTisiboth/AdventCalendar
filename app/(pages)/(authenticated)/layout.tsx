import { ReactNode } from "react"
import { requireAuth } from "@safeguards"

/**
 * Authenticated Layout
 * Protects all routes that require user authentication
 */
export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
    // Safeguard: Require authentication for all child routes
    await requireAuth()

    return <>{children}</>
}
