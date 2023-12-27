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
import { useContext, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import MenuIcon from "@mui/icons-material/Menu"
import { useLogout } from "../hooks/useLogout"
import { useAuthStore } from "../store"

const drawerWidth = 240

export const NavBar = () => {
    const navigate = useNavigate()
    const { logout } = useLogout()
    const [isLoggedIn] = useAuthStore((state) => [state.isLoggedIn])
    const [mobileOpen, setMobileOpen] = useState(false)

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

                <ListItem key={"Calendar"} disablePadding>
                    <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/calendar" })}>
                        <ListItemText primary={"Calender"} />
                    </ListItemButton>
                </ListItem>

                <ListItem key={"Test"} disablePadding>
                    <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/test" })}>
                        <ListItemText primary={"Test"} />
                    </ListItemButton>
                </ListItem>
                {!isLoggedIn && (
                    <ListItem key={"Login"} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }} onClick={() => navigate({ to: "/login" })}>
                            <ListItemText primary={"Login"} />
                        </ListItemButton>
                    </ListItem>
                )}
                {isLoggedIn && (
                    <ListItem key={"Logout"} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }} onClick={logout}>
                            <ListItemText primary={"Logout"} />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    )

    const container = window !== undefined ? () => window.document.body : undefined

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

                        <Button key={"Calendar"} onClick={() => navigate({ to: "/calendar" })}>
                            <ListItemText primary="Calendar" />
                        </Button>

                        <Button key={"Test"} onClick={() => navigate({ to: "/test" })}>
                            <ListItemText primary="Test" />
                        </Button>
                        {!isLoggedIn && (
                            <Button key={"Login"} onClick={() => navigate({ to: "/login" })}>
                                <ListItemText primary="Login" />
                            </Button>
                        )}
                        {isLoggedIn && (
                            <Button key={"Logout"} onClick={logout}>
                                <ListItemText primary="Logout" />
                            </Button>
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
