"use client"

import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material"
import { useRouter } from "next/navigation"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AddIcon from "@mui/icons-material/Add"

export default function AdminDashboard() {
    const router = useRouter()

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Welcome to Admin Dashboard
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <CalendarTodayIcon sx={{ mr: 1, fontSize: 40 }} />
                                <Typography variant="h5">Manage Calendars</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                View, edit, and manage all advent calendars
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => router.push("/admin/manage")}
                                fullWidth
                            >
                                Go to Calendars
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <AddIcon sx={{ mr: 1, fontSize: 40 }} />
                                <Typography variant="h5">Create Calendar</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Create a new advent calendar with 24 pictures
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => router.push("/admin/manage/create")}
                                fullWidth
                            >
                                Create New
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}
