import {
    Router,
    RootRoute,
    Route, Outlet
} from "@tanstack/react-router"
import { Home } from "./components/Home"
import { Error } from "./components/error"


const Root = () => {
    return (
        <>
            <Outlet />
        </>
    )
}
const rootRoute = new RootRoute({
    component: Root,
})

const homeRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/a',
    component: Home,
})

// Create a home route
const errorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: Error,
})


// Create the route tree using your routes
const routeTree = rootRoute.addChildren([homeRoute, errorRoute])

// Create the router using your route tree
const router = new Router({ routeTree })

export { router }