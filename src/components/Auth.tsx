import { Navigate, Outlet } from "@tanstack/react-router"
import { FC, useContext } from "react"
import { GlobalContext } from "../context"
import { useLocation } from "react-router-dom"
import { BackdropSpinner } from "./Calendar/Backdrop"

export const Auth: FC = () => {
    const location = useLocation()
    const { isLoggedIn, jwt } = useContext(GlobalContext)

    if (!isLoggedIn && jwt !== "") return <BackdropSpinner />

    if (!isLoggedIn && !jwt) return <Navigate to="/login" replace state={{ from: location }} />

    return <Outlet />
}
