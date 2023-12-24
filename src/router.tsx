import { Router, RootRoute, Route, Outlet } from "@tanstack/react-router"
import { CalendarTest } from "./components/Calendar/CalendarTest"
import { Error } from "./components/error"
import Login from "./components/Login/Login"
import Calendar from "./components/Calendar/Calendar"
import { Auth } from "./components/Auth"
import { NavBar } from "./components/NavBar"
import { Alert, Box, Snackbar } from "@mui/material"
import { Home } from "./components/Home"
import { useContext } from "react"
import { GlobalContext } from "./context"

const RootComponent = () => {
    const { open, handleSnackBarClose, message, severity } = useContext(GlobalContext)
    return (
        <>
            <NavBar />
            <Box
                sx={{
                    paddingTop: 9,
                    paddingLeft: 1,
                    paddingRight: 1
                }}
            >
                <Outlet />
            </Box>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={handleSnackBarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleSnackBarClose} severity={severity} sx={{ width: "100%" }}>
                    {message}
                </Alert>
            </Snackbar>
        </>
    )
}
const rootRoute = new RootRoute({
    component: RootComponent
})

const homeRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home
})

const loginRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: Login
})

const authCalendarRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/calendar",
    component: Auth
})

const calendarRoute = new Route({
    getParentRoute: () => authCalendarRoute,
    path: "/",
    component: Calendar
})
authCalendarRoute.addChildren([calendarRoute])

const calendarTest = new Route({
    getParentRoute: () => rootRoute,
    path: "/test",
    component: CalendarTest
})

const errorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "*",
    component: Error
})

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([homeRoute, authCalendarRoute, loginRoute, calendarTest, errorRoute])

// Create the router using your route tree
const router = new Router({ routeTree })

export { router }
