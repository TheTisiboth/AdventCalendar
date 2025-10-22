import { redirect } from "next/navigation"
import { isInAdventPeriod } from "@/utils/utils"

/**
 * Safeguard: Ensure we're in the advent period (Dec 1-24)
 * Redirects to home if not in advent period
 */
export async function requireAdventPeriod() {
    if (!isInAdventPeriod()) {
        redirect("/")
    }
}

/**
 * Safeguard: Check if we're in advent period without redirecting
 * Returns boolean
 */
export function checkAdventPeriod() {
    return isInAdventPeriod()
}
