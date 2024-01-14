import { useEffect } from "react"
import { useAuthStoreMulti } from "../store"
import { useAPI } from "./useAPI"

export const useAuth = () => {
    const { jwt, setIsLoggedIn, setJWT, isLoggedIn } = useAuthStoreMulti("jwt", "setJWT", "setIsLoggedIn", "isLoggedIn")
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
