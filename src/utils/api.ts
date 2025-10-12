/**
 * Centralized API fetch wrapper with automatic auth error handling
 * Now works with Kinde authentication (cookie-based, no manual headers needed)
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
    // Kinde uses HTTP-only cookies, so we don't need to manually add auth headers
    // The browser automatically sends cookies with the request
    const response = await fetch(url, {
        ...options,
        credentials: 'same-origin', // Ensure cookies are sent
        headers: {
            ...options.headers
        }
    })

    // Handle authentication errors
    if (response.status === 401) {
        throw new AuthenticationError("Session expired. Please login again.")
    }

    return response
}
