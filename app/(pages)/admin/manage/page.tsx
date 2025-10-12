"use client"

import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import AddIcon from "@mui/icons-material/Add"

type Calendar = {
    id: number
    year: number
    title: string
    description: string | null
    isArchived: boolean
    isPublished: boolean
    pictureCount: number
}

export default function ManageCalendars() {
    const router = useRouter()

    const { data: calendars, isLoading, error } = useQuery<Calendar[], Error>({
        queryKey: ["admin-calendars"],
        queryFn: async () => {
            const jwt = localStorage.getItem("jwt")
            const response = await fetch("/api/admin/calendars", {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `Failed to fetch calendars (${response.status})`)
            }
            return response.json()
        }
    })

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Manage Calendars
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push("/admin/manage/create")}
                >
                    Create New Calendar
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error.message}
                </Alert>
            )}

            {isLoading ? (
                <Typography>Loading...</Typography>
            ) : calendars && calendars.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Year</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Pictures</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calendars?.map((calendar) => (
                                <TableRow key={calendar.id}>
                                    <TableCell>{calendar.year}</TableCell>
                                    <TableCell>{calendar.title}</TableCell>
                                    <TableCell>{calendar.description || "-"}</TableCell>
                                    <TableCell>{calendar.pictureCount}/24</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            {calendar.isPublished ? (
                                                <Chip label="Published" color="success" size="small" />
                                            ) : (
                                                <Chip label="Draft" color="warning" size="small" />
                                            )}
                                            {calendar.isArchived && (
                                                <Chip label="Archived" color="default" size="small" />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            onClick={() => router.push(`/admin/manage/edit/${calendar.year}`)}
                                        >
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No calendars found. Create your first calendar!</Typography>
            )}
        </Box>
    )
}
