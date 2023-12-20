import { useEffect, useState } from "react"

type ScreeSize = {
    isMobile: boolean
    imageSize: string
}
export const useScreenSize = (): ScreeSize => {
    const [screenWidth, setWidth] = useState(window.innerWidth)
    const isMobile = screenWidth <= 992
    const imageSize = isMobile ? "5em" : "13em"

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return {
        isMobile,
        imageSize
    }
}
