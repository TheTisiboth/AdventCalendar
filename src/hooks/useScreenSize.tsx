import { useEffect } from "react"
import { useResponsiveStoreMulti } from "../store"

export const useScreenSize = () => {
    const { setImageSize, setIsMobile } = useResponsiveStoreMulti("setImageSize", "setIsMobile")
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 992
            setImageSize(isMobile ? "5em" : "13em")
            setIsMobile(isMobile)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
}
