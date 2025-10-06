import { NextRequest, NextResponse } from "next/server"
import { checkAuth } from "../lib/auth"

export async function GET(request: NextRequest) {
    try {
        await checkAuth(request)
        return NextResponse.json({ ok: true })
    } catch (error) {
        return NextResponse.json({ ok: false, error: String(error) }, { status: 401 })
    }
}
