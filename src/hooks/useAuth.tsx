import { useEffect } from "react"
import { useAuthStore } from "@/store"
import { useAPI } from "./useAPI"

export const useAuth = () => {
    const { jwt, setIsLoggedIn, setJWT, isLoggedIn } = useAuthStore("jwt", "setJWT", "setIsLoggedIn", "isLoggedIn")
    const { authenticate } = useAPI()
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
