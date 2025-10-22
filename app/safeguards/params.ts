import { redirect, notFound } from "next/navigation"

/**
 * Safeguard: Validate and parse a year parameter
 * Redirects to fallback route if invalid
 * Returns the parsed year number
 */
export function validateYearParam(yearParam: string, fallbackRoute: string = "/"): number {
    const year = parseInt(yearParam)

    if (isNaN(year)) {
        redirect(fallbackRoute)
    }

    return year
}

/**
 * Safeguard: Validate year parameter with 404 on invalid
 * Returns the parsed year number or triggers notFound()
 */
export function requireValidYear(yearParam: string): number {
    const year = parseInt(yearParam)

    if (isNaN(year) || year < 2000 || year > 2100) {
        notFound()
    }

    return year
}

/**
 * Safeguard: Validate numeric ID parameter
 * Returns the parsed ID or triggers notFound()
 */
export function requireValidId(idParam: string): number {
    const id = parseInt(idParam)

    if (isNaN(id) || id < 1) {
        notFound()
    }

    return id
}
