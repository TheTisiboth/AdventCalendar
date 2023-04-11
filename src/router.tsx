import {
    Router,
    RootRoute,
    Route, Outlet
} from "@tanstack/react-router"
import { Home } from "./components/Home"
import { Error } from "./components/error"
import Login from "./components/Login"
import Calendar from "./components/Calendar"
import { Auth } from "./components/Auth"


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

const loginRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
})


const authCalendarRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/calendar',
    component: Auth,

})
const calendarRoute = new Route({
    getParentRoute: () => authCalendarRoute,
    path: '/',
    component: Calendar,
})
authCalendarRoute.addChildren([calendarRoute])

const errorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: Error,
})


// Create the route tree using your routes
const routeTree = rootRoute.addChildren([homeRoute, authCalendarRoute, loginRoute, errorRoute])

// Create the router using your route tree
const router = new Router({ routeTree })

export { router }