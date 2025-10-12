"use client"

import { ReactNode } from "react"
import { Box, Container } from "@mui/material"
import { Auth } from "@/components/Auth"
import { NavBar } from "@/components/NavBar"

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <Auth>
            <NavBar />
            <Box sx={{ mt: 10 }}>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {children}
                </Container>
            </Box>
        </Auth>
    )
}
