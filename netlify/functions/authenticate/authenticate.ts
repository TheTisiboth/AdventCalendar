import { Handler } from "@netlify/functions"
import { authMiddleware } from "../../utils/middleware"
import middy from "middy"

const func: Handler = async (_event, _context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ ok: true })
    }
}

// Use authMiddleware to protect the route
export const handler = middy(func).use(authMiddleware())
