import { Box, Typography, Divider, List, ListItem, ListItemButton, ListItemText, CssBaseline, AppBar, Toolbar, IconButton, Button, Drawer } from "@mui/material";
import React, { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from '@tanstack/react-router'

const drawerWidth = 240;

export const NavBar = () => {
    // const window = () => Window;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>

            <List>
                <ListItem key={"Home"} disablePadding>
                    <ListItemButton sx={{ textAlign: 'center' }}>
                        <ListItemText sx={{ color: '#000' }} primary={<Link to="/">Home</Link>} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={"Calendar"} disablePadding>
                    <ListItemButton sx={{ textAlign: 'center' }}>
                        <ListItemText sx={{ color: '#fff' }} primary={<Link to="/calendar">Calendar</Link>} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={"Test"} disablePadding>
                    <ListItemButton sx={{ textAlign: 'center' }}>
                        <ListItemText primary={<Link to="/test">Test</Link>} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={"Login"} disablePadding>
                    <ListItemButton sx={{ textAlign: 'center' }}>
                        <ListItemText primary={<Link to="/login">Login</Link>} />
                    </ListItemButton>
                </ListItem>

            </List>
        </Box>
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >

                    </IconButton>

                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Button key={"Home"} sx={{ color: '#fff' }}>
                            <Link to="/">Home</Link>
                        </Button>
                        <Button key={"Calendar"} sx={{ color: '#fff' }}>
                            <Link to="/calendar">Calendar</Link>
                        </Button>
                        <Button key={"Test"} sx={{ color: '#fff' }}>
                            <Link to="/test">Test</Link>
                        </Button>
                        <Button key={"Login"} sx={{ color: '#fff' }}>
                            <Link to="/login">Login</Link>
                        </Button>

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
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        color: '#000',
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    );
}