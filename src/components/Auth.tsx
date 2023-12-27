import { Navigate, Outlet } from "@tanstack/react-router"
import { FC } from "react"
import { useLocation } from "react-router-dom"
import { BackdropSpinner } from "./Calendar/Backdrop"
import { useAuthStore } from "../store"

export const Auth: FC = () => {
    const location = useLocation()
    const [isLoggedIn, jwt] = useAuthStore((state) => [state.isLoggedIn, state.jwt])
    if (!isLoggedIn && jwt !== "") return <BackdropSpinner />

    if (!isLoggedIn && !jwt) return <Navigate to="/login" replace state={{ from: location }} />

    return <Outlet />
}
