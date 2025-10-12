"use client"

import { Box, Grid, Typography, Button, Paper } from "@mui/material"
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"

const Login = () => {
    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "100vh" }}
        >
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                        Advent Calendar
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Sign in to view your personalized advent calendar
                    </Typography>
                    <LoginLink>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ py: 1.5 }}
                        >
                            Sign In with Kinde
                        </Button>
                    </LoginLink>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default Login
