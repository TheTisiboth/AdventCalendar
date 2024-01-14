import { useNavigate } from "@tanstack/react-router"
import { dummyUser, useAuthStore } from "../store"

export const useLogout = () => {
    const navigate = useNavigate()
    const { setUser, setIsLoggedIn, setJWT } = useAuthStore("setUser", "setIsLoggedIn", "setJWT")
    const logout = () => {
        setUser(dummyUser)
        setIsLoggedIn(false)
        setJWT("")
        localStorage.removeItem("jwt")
        navigate({ to: "/" })
    }

    return { logout }
}
