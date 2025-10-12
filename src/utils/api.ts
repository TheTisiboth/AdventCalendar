/**
 * Centralized API fetch wrapper with automatic auth error handling
 */

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthenticationError"
    }
}

export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const jwt = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        }
    })

    // Handle authentication errors
    if (response.status === 401) {
        // Clear invalid auth data
        if (typeof window !== 'undefined') {
            localStorage.removeItem("jwt")
            localStorage.removeItem("user")
        }

        throw new AuthenticationError("Session expired. Please login again.")
    }

    return response
}
