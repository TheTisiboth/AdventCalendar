import { useEffect, useState } from "react"
import { useResponsiveStore } from "../store"
import { useShallow } from "zustand/react/shallow"

export const useScreenSize = () => {
    const [setImageSize, setIsMobile] = useResponsiveStore(
        useShallow((state) => [state.setImageSize, state.setIsMobile])
    )
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
