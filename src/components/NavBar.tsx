"use client"

import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Button,
    Drawer
} from "@mui/material"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MenuIcon from "@mui/icons-material/Menu"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { isInAdventPeriod } from "@/utils/utils"

const drawerWidth = 240

export const NavBar = () => {
    const router = useRouter()
    const navigate = (pathOrOptions: string | { to: string }) => {
        const path = typeof pathOrOptions === 'string' ? pathOrOptions : pathOrOptions.to
        router.push(path)
    }
    const { isAuthenticated, isLoading, getPermission, user } = useKindeBrowserClient()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        // Check if we're in the Advent period
        setShowCalendar(isInAdventPeriod())
    }, [])

    useEffect(() => {
        // Check if user has admin permission
        const checkAdmin = async () => {
            if (isAuthenticated) {
                const adminPerm = await getPermission("admin:access")
                setIsAdmin(adminPerm?.isGranted ?? false)
            }
        }
        checkAdmin()
    }, [isAuthenticated, getPermission])

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState)
    }

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <List>
                <ListItem key={"Home"} disablePadding>
                    <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/" })}>
                        <ListItemText primary={"Home"} />
                    </ListItemButton>
                </ListItem>

                {showCalendar && (
                    <ListItem key={"Calendar"} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/calendar" })}>
                            <ListItemText primary={"Calender"} />
                        </ListItemButton>
                    </ListItem>
                )}

                <ListItem key={"Archive"} disablePadding>
                    <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/archive" })}>
                        <ListItemText primary={"Archive"} />
                    </ListItemButton>
                </ListItem>

                {isAdmin && (
                    <ListItem key={"Admin"} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/admin" })}>
                            <ListItemText primary={"Admin"} />
                        </ListItemButton>
                    </ListItem>
                )}

                <ListItem key={"Test"} disablePadding>
                    <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/test" })}>
                        <ListItemText primary={"Test"} />
                    </ListItemButton>
                </ListItem>
                {!isAuthenticated && !isLoading && (
                    <ListItem key={"Login"} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/login" })}>
                            <ListItemText primary={"Login"} />
                        </ListItemButton>
                    </ListItem>
                )}
                {isAuthenticated && (
                    <ListItem key={"Logout"} disablePadding>
                        <LogoutLink>
                            <ListItemButton sx={{ textAlign: "center" }}>
                                <ListItemText primary={"Logout"} />
                            </ListItemButton>
                        </LogoutLink>
                    </ListItem>
                )}
            </List>
        </Box>
    )

    const container = typeof window !== 'undefined' ? () => window.document.body : undefined

    return (
        <Box sx={{ display: "flex", className: "NavBar" }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <Button onClick={() => navigate({ to: "/" })}>
                            <ListItemText primary="Home" />
                        </Button>

                        {showCalendar && (
                            <Button key={"Calendar"} onClick={() => navigate({ to: "/calendar" })}>
                                <ListItemText primary="Calendar" />
                            </Button>
                        )}

                        <Button key={"Archive"} onClick={() => navigate({ to: "/archive" })}>
                            <ListItemText primary="Archive" />
                        </Button>

                        {isAdmin && (
                            <Button key={"Admin"} onClick={() => navigate({ to: "/admin" })}>
                                <ListItemText primary="Admin" />
                            </Button>
                        )}

                        <Button key={"Test"} onClick={() => navigate({ to: "/test" })}>
                            <ListItemText primary="Test" />
                        </Button>
                        {!isAuthenticated && !isLoading && (
                            <Button key={"Login"} onClick={() => navigate({ to: "/login" })}>
                                <ListItemText primary="Login" />
                            </Button>
                        )}
                        {isAuthenticated && (
                            <LogoutLink>
                                <Button key={"Logout"}>
                                    <ListItemText primary="Logout" />
                                </Button>
                            </LogoutLink>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    )
}
