"use client"

import { FC, ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackdropSpinner } from "./Calendar/Backdrop"
import { useAuthStore } from "@/store"

export const Auth: FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const { isLoggedIn, jwt } = useAuthStore("isLoggedIn", "jwt")

    useEffect(() => {
        if (!isLoggedIn && !jwt) {
            router.push("/login")
        }
    }, [isLoggedIn, jwt, router])

    if (!isLoggedIn && jwt !== "") return <BackdropSpinner />
    if (!isLoggedIn && !jwt) return <BackdropSpinner />

    return <>{children}</>
}
