import { useEffect } from "react"
import { useAuthStore } from "@/store"
import { useAuthAPI } from "./api/useAuthAPI"

export const useAuth = () => {
    const { jwt, setIsLoggedIn, setJWT, isLoggedIn } = useAuthStore("jwt", "setJWT", "setIsLoggedIn", "isLoggedIn")
    const { authenticate } = useAuthAPI()
    useEffect(() => {
        const authentication = async () => {
            if (jwt !== "" && !isLoggedIn) {
                try {
                    await authenticate()
                    setIsLoggedIn(true)
                } catch (e) {
                    setJWT("")
                    localStorage.removeItem("jwt")
                }
            }
        }
        authentication()
    }, [jwt, isLoggedIn, authenticate, setIsLoggedIn, setJWT])
}
