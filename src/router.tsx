import {
    Router,
    RootRoute,
    Route, Outlet
} from "@tanstack/react-router"
import { CalendarTest } from "./components/CalendarTest"
import { Error } from "./components/error"
import Login from "./components/Login"
import Calendar from "./components/Calendar"
import { Auth } from "./components/Auth"
import { NavBar } from "./components/NavBar"
import { Box } from "@mui/material"
import { Home } from "./components/Home"


const Root = () => {
    return (
        <>
            <NavBar />
            <Box sx={{ p: 8 }}>
                <Outlet />
            </Box>
        </>
    )
}
const rootRoute = new RootRoute({
    component: Root,
})

const homeRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
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

const calendarTest = new Route({
    getParentRoute: () => rootRoute,
    path: '/test',
    component: CalendarTest,
})

const errorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: Error,
})


// Create the route tree using your routes
const routeTree = rootRoute.addChildren([homeRoute, authCalendarRoute, loginRoute, calendarTest, errorRoute])

// Create the router using your route tree
const router = new Router({ routeTree })

export { router }