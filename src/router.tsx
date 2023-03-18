import {
    Router,
    RootRoute,
    Route, Link, Outlet
} from "@tanstack/react-router"
import { Home } from "./components/Home"
import { Test } from "./components/test"
import { Error } from "./components/error"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"


const Root = () => {
    return (<>
        <Link to="/test">Test</Link><br />
        <Link to="/">Home</Link>
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
    component: Test,
})


// Create a home route
const errorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: Error,
})


// Create the route tree using your routes
const routeTree = rootRoute.addChildren([homeRoute, testRoute, errorRoute])

// Create the router using your route tree
const router = new Router({ routeTree })

// declare module '@tanstack/react-router' {
//     interface Register {
//         router: typeof router
//     }
// }
export { router }