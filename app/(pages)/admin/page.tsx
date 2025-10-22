import { Box, Typography, Card, CardContent } from "@mui/material"
import Grid from "@mui/material/Grid"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AddIcon from "@mui/icons-material/Add"
import Link from "next/link"
import { AdminDashboardButton } from "@/components/Admin/AdminDashboardButton"

export default function AdminDashboard() {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Welcome to Admin Dashboard
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <CalendarTodayIcon sx={{ mr: 1, fontSize: 40 }} />
                                <Typography variant="h5">Manage Calendars</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                View, edit, and manage all advent calendars
                            </Typography>
                            <Link href="/admin/manage">
                                <AdminDashboardButton variant="contained" fullWidth>
                                    Go to Calendars
                                </AdminDashboardButton>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <AddIcon sx={{ mr: 1, fontSize: 40 }} />
                                <Typography variant="h5">Create Calendar</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Create a new advent calendar with 24 pictures
                            </Typography>
                            <Link href="/admin/manage/create">
                                <AdminDashboardButton variant="contained" color="secondary" fullWidth>
                                    Create New
                                </AdminDashboardButton>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
