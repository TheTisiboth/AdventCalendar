import { useEffect, useState } from "react"
import { useResponsiveStore } from "../store"

export const useScreenSize = () => {
    const [setImageSize, setIsMobile] = useResponsiveStore((state) => [state.setImageSize, state.setIsMobile])

    useEffect(() => {
        const handleResize = () => {
            // setWidth(window.innerWidth)
            const isMobile = window.innerWidth <= 992
            setImageSize(isMobile ? "5em" : "13em")
            setIsMobile(isMobile)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
}
