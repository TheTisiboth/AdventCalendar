import { useEffect } from "react"
import { useResponsiveStore } from "../store"

export const useScreenSize = () => {
    const { setImageSize, setIsMobile } = useResponsiveStore("setImageSize", "setIsMobile")
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
