import { Handler } from "@netlify/functions";
import { authMiddleware } from "../../utils/middleware";
import middy from "middy";

const func: Handler = async (event, context) => {
  return {
    statusCode: 200
  }
}

// Use authMiddleware to protect the route
export const handler = middy(func).use(authMiddleware())