import { NextRequest, NextResponse } from "next/server"
import { requireKindeAdmin } from "@api/lib/kindeAuth"

/**
 * GET /api/admin/users
 * Returns all users from Kinde for admin to assign calendars
 * Requires admin permission
 */
export async function GET(request: NextRequest) {
    try {
        // Check if user is admin
        await requireKindeAdmin()

        // Get Kinde Management API credentials
        const kindeIssuerUrl = process.env.KINDE_ISSUER_URL!
        const clientId = process.env.KINDE_CLIENT_ID!
        const clientSecret = process.env.KINDE_CLIENT_SECRET!

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
            throw new Error("Failed to get Kinde API access token")
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        // Fetch users from Kinde Management API
        const usersResponse = await fetch(`${kindeIssuerUrl}/api/v1/users`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json"
            }
        })

        if (!usersResponse.ok) {
            throw new Error("Failed to fetch users from Kinde")
        }

        const usersData = await usersResponse.json()

        // Transform users to simple format
        const users = usersData.users?.map((user: any) => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
        })) || []

        return NextResponse.json(users)
    } catch (error) {
        console.error("Admin users API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch users" },
            { status: 401 }
        )
    }
}
