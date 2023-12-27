import { useContext } from "react"
import { useNavigate } from "@tanstack/react-router"
import { dummyUser, useAuthStore } from "../store"

export const useLogout = () => {
    const navigate = useNavigate()
    const [setUser, setIsLoggedIn, setJWT] = useAuthStore((state) => [state.setUser, state.setIsLoggedIn, state.setJWT])
    const logout = () => {
        setUser(dummyUser)
        setIsLoggedIn(false)
        setJWT("")
        localStorage.removeItem("jwt")
        navigate({ to: "/" })
    }

    return { logout }
}
