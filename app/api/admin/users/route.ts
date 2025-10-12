import { NextRequest, NextResponse } from "next/server"
import { requireKindeAdmin } from "@api/lib/kindeAuth"

type KindeUserResponse = {
    id: string
    email: string
    first_name?: string
    last_name?: string
}

/**
 * GET /api/admin/users
 * Returns all users from Kinde for admin to assign calendars
 * Requires admin permission
 */
export async function GET(_request: NextRequest) {
    try {
        // Check if user is admin
        await requireKindeAdmin()

        // Get Kinde Management API credentials
        // Use M2M credentials if available, otherwise fall back to regular credentials
        const kindeIssuerUrl = process.env.KINDE_ISSUER_URL!
        const clientId = process.env.KINDE_M2M_CLIENT_ID
        const clientSecret = process.env.KINDE_M2M_CLIENT_SECRET

        if (!kindeIssuerUrl || !clientId || !clientSecret) {
            throw new Error("Kinde configuration missing")
        }

        // Get access token for Management API
        const tokenResponse = await fetch(`${kindeIssuerUrl}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
                audience: `${kindeIssuerUrl}/api`
            })
        })

        if (!tokenResponse.ok) {
            throw new Error(`Failed to get Kinde API access token: ${tokenResponse.status}`)
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        if (!accessToken) {
            throw new Error("No access token received from Kinde")
        }

        // Fetch users from Kinde Management API
        const usersResponse = await fetch(`${kindeIssuerUrl}/api/v1/users`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json"
            }
        })

        if (!usersResponse.ok) {
            throw new Error(`Failed to fetch users from Kinde: ${usersResponse.status}. Check M2M permissions in Kinde dashboard.`)
        }

        const usersData = await usersResponse.json()

        // Transform users to simple format
        // Kinde API might return { users: [...] } or just an array
        const usersList = Array.isArray(usersData) ? usersData : (usersData.users || [])

        const users = usersList.map((user: KindeUserResponse) => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
        }))

        return NextResponse.json(users)
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("Admin access required") ? 403 : 500
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch users" },
            { status: statusCode }
        )
    }
}
