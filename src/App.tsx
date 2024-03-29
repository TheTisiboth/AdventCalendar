import "./App.css"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useRegisterSW } from "virtual:pwa-register/react"
import { BrowserRouter } from "react-router-dom"
import { useMainHook } from "./hooks/useMainHook"

// Register your router for maximum type safety
declare module "@tanstack/router" {
    interface Register {
        router: typeof router
    }
}
export const App = () => {
    // Reload the PWA when a new version is available
    useRegisterSW({ immediate: true })
    useMainHook()

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* TODO: remove BrowserRouter. It is only necessary for using useLocation in some hooks */}
            <BrowserRouter>
                <RouterProvider router={router} />
            </BrowserRouter>
        </LocalizationProvider>
    )
}
