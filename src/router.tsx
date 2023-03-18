import {
    Router,
    RootRoute,
    Route,
    Outlet,
    Link,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Home } from "./components/Home"

const Root = () => {
    return (<>
        <p>Test</p>
        <Link to="/test">Test</Link>
        <Link to="/a">Home</Link>
        <Outlet />
        <TanStackRouterDevtools />
    </>)
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
const testRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/test',
    component: Home,
})


// Create a home route
const errorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: Home,
})


// Create the route tree using your routes
const routeTree = rootRoute.addChildren([homeRoute, testRoute, errorRoute])

// Create the router using your route tree
const router = new Router({ routeTree })

declare module '@tanstack/router' {
    interface Register {
        router: typeof router
    }
}
export { router }