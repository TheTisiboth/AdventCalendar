import { HandlerLambda, NextFunction } from "middy"
import { checkAuth } from "./auth"

export const authMiddleware = () => {
    return {
        // Before handling protected requests, check if user is authenticated
        before: (handler: HandlerLambda, next: NextFunction) => {
            checkAuth(handler.event)
                .then((user) => {
                    handler.event.user = user
                    return next()
                })
                .catch((error) => {
                    return handler.callback(null, {
                        statusCode: 401,
                        body: JSON.stringify({
                            error: error.message
                        })
                    })
                })
        }
    }
}
