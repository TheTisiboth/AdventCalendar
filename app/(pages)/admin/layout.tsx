"use client"

import { ReactNode, useEffect, useState } from "react"
import { Box, Container, Alert, Typography } from "@mui/material"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { NavBar } from "@/components/NavBar"
import { BackdropSpinner } from "@/components/Calendar/Backdrop"

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, getPermission } = useKindeBrowserClient()
    const [isAdmin, setIsAdmin] = useState(false)
    const [checkingPermissions, setCheckingPermissions] = useState(true)

    useEffect(() => {
        const checkAdmin = async () => {
            if (!isLoading && isAuthenticated) {
                const adminPerm = await getPermission("admin:access")
                setIsAdmin(adminPerm?.isGranted ?? false)
                setCheckingPermissions(false)
            } else if (!isLoading && !isAuthenticated) {
                setCheckingPermissions(false)
            }
        }
        checkAdmin()
    }, [isAuthenticated, isLoading, getPermission])

    if (isLoading || checkingPermissions) {
        return <BackdropSpinner />
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <>
                <NavBar />
                <Container maxWidth="sm" sx={{ mt: 15 }}>
                    <Alert severity="error">
                        <Typography variant="h6" gutterBottom>
                            Access Denied
                        </Typography>
                        <Typography>
                            You do not have permission to access the admin panel. Please contact an administrator if you need access.
                        </Typography>
                    </Alert>
                </Container>
            </>
        )
    }

    return (
        <>
            <NavBar />
            <Box sx={{ mt: 10 }}>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {children}
                </Container>
            </Box>
        </>
    )
}
