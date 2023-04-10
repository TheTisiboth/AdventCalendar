import { Handler } from "@netlify/functions";
import middy from 'middy'
import { authMiddleware } from '../../utils/middleware'

const func: Handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ msg: "User authentified" }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

// Use authMiddleware to protect the route
export const handler = middy(func).use(authMiddleware())