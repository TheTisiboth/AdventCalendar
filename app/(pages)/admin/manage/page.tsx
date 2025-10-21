"use client"

import { useState } from "react"
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import { authenticatedFetch } from "@/utils/api"

type Calendar = {
    id: number
    year: number
    title: string
    description: string | null
    isPublished: boolean
    kindeUserId: string | null
    pictureCount: number
}

type KindeUser = {
    id: string
    email: string
    fullName: string
}

export default function ManageCalendars() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [calendarToDelete, setCalendarToDelete] = useState<Calendar | null>(null)

    const { data: calendars, isLoading, error } = useQuery<Calendar[], Error>({
        queryKey: ["admin-calendars"],
        queryFn: async () => {
            try {
                const response = await authenticatedFetch("/api/admin/calendars")
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || `Failed to fetch calendars (${response.status})`)
                }
                return response.json()
            } catch (error) {
                // AuthenticationError will be handled by middleware redirecting to login
                throw error
            }
        }
    })

    const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery<KindeUser[], Error>({
        queryKey: ["kinde-users"],
        queryFn: async () => {
            try {
                const response = await authenticatedFetch("/api/admin/users")
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || `Failed to fetch users (${response.status})`)
                }

                return await response.json()
            } catch (error) {
                throw error
            }
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (year: number) => {
            try {
                const response = await authenticatedFetch(`/api/admin/calendars/${year}`, {
                    method: "DELETE"
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to delete calendar")
                }
                return response.json()
            } catch (error) {
                // AuthenticationError will be handled by middleware redirecting to login
                throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-calendars"] })
            setDeleteDialogOpen(false)
            setCalendarToDelete(null)
        }
    })


    const handleDeleteClick = (calendar: Calendar) => {
        setCalendarToDelete(calendar)
        setDeleteDialogOpen(true)
    }

    const getUserDisplayName = (kindeUserId: string | null): string => {
        if (!kindeUserId) return "Unassigned"
        if (isLoadingUsers) return "Loading..."
        const user = users?.find((u) => u.id === kindeUserId)
        return user ? user.email : "Unknown User"
    }

    const handleDeleteConfirm = () => {
        if (calendarToDelete) {
            deleteMutation.mutate(calendarToDelete.year)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setCalendarToDelete(null)
    }

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

            {usersError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Failed to load users: {usersError.message}
                </Alert>
            )}

            {usersError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Failed to load users: {usersError.message}
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
                                <TableCell>Assigned User</TableCell>
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
                                        <Typography variant="body2">
                                            {getUserDisplayName(calendar.kindeUserId)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {calendar.isPublished ? (
                                            <Chip label="Published" color="success" size="small" />
                                        ) : (
                                            <Chip label="Draft" color="warning" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                size="small"
                                                onClick={() => router.push(`/admin/manage/edit/${calendar.year}`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDeleteClick(calendar)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No calendars found. Create your first calendar!</Typography>
            )}

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Delete Calendar</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the calendar for {calendarToDelete?.year}?
                        This will permanently delete all {calendarToDelete?.pictureCount} pictures from storage.
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={deleteMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
