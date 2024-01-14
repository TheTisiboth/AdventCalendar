import { useAuth } from "./useAuth"
import { useScreenSize } from "./useScreenSize"

export const useMainHook = () => {
    useAuth()
    useScreenSize()
}
