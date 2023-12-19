import { useContext } from "react"
import { GlobalContext, dummyUser } from "../context"
import { useNavigate } from "@tanstack/react-router"

export const useLogout = () => {
    const navigate = useNavigate()
    const { setAuthorized, setUser, setIsLoggedIn, setJWT } = useContext(GlobalContext)

    const logout = () => {
        setAuthorized(false)
        setUser(dummyUser)
        setIsLoggedIn(false)
        setJWT("")
        localStorage.removeItem("jwt")
        navigate({ to: "/" })
    }

    return { logout }
}