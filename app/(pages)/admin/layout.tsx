import { ReactNode } from "react"
import { Box, Container } from "@mui/material"
import { NavBar } from "@/components/NavBar"
import { requireAdmin } from "@safeguards"

export default async function AdminLayout({ children }: { children: ReactNode }) {
    // Safeguard: Require admin access for all admin routes
    // This layout protects all /admin/* pages
    await requireAdmin()

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
