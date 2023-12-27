import { useEffect } from "react"
import { useAuthStore } from "../store"
import { useAPI } from "./useAPI"
import { useShallow } from "zustand/react/shallow"

export const useAuth = () => {
    const [jwt, setIsLoggedIn, setJWT, isLoggedIn] = useAuthStore(
        useShallow((state) => [state.jwt, state.setIsLoggedIn, state.setJWT, state.isLoggedIn])
    )
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
