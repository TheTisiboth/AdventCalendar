import "./App.css"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { MyProvider } from "./context"
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from "virtual:pwa-register/react"
import { BrowserRouter } from "react-router-dom"

// Register your router for maximum type safety
declare module "@tanstack/router" {
    interface Register {
        router: typeof router
    }
}
export const App = () => {
    // Reload the PWA when a new version is available
    useRegisterSW({ immediate: true })

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MyProvider>
                {/* TODO: remove BrowserRouter. It is only necessary for using useLocation in some hooks */}
                <BrowserRouter>
                    <RouterProvider router={router} />
                </BrowserRouter>
            </MyProvider>
        </LocalizationProvider>
    )
}
