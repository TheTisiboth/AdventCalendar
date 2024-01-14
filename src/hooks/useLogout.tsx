import { useNavigate } from "@tanstack/react-router"
import { dummyUser, useAuthStoreMulti } from "../store"

export const useLogout = () => {
    const navigate = useNavigate()
    const { setUser, setIsLoggedIn, setJWT } = useAuthStoreMulti("setUser", "setIsLoggedIn", "setJWT")
    const logout = () => {
        setUser(dummyUser)
        setIsLoggedIn(false)
        setJWT("")
        localStorage.removeItem("jwt")
        navigate({ to: "/" })
    }

    return { logout }
}
