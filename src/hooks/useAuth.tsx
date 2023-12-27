import { useEffect } from "react"
import { useAuthStore } from "../store"
import { useAPI } from "./useAPI"

export const useAuth = () => {
    const [jwt, setIsLoggedIn, setJWT, isLoggedIn] = useAuthStore((state) => [
        state.jwt,
        state.setIsLoggedIn,
        state.setJWT,
        state.isLoggedIn
    ])
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
    }, [])
}
