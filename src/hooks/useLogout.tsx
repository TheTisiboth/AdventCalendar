import { useRouter } from "next/navigation"
import { dummyUser, useAuthStore } from "@/store"

export const useLogout = () => {
    const router = useRouter()
    const { setUser, setIsLoggedIn, setJWT } = useAuthStore("setUser", "setIsLoggedIn", "setJWT")
    const logout = () => {
        setUser(dummyUser)
        setIsLoggedIn(false)
        setJWT("")
        if (typeof window !== 'undefined') {
            localStorage.removeItem("jwt")
            localStorage.removeItem("user")
        }
        router.push("/")
    }

    return { logout }
}
