"use client"

import { useState } from "react"
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
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import { authenticatedFetch, AuthenticationError } from "@/utils/api"
import { useLogout } from "@/hooks/useLogout"

type Calendar = {
    id: number
    year: number
    title: string
    description: string | null
    isArchived: boolean
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
    const { logout } = useLogout()
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
                if (error instanceof AuthenticationError) {
                    logout()
                }
                throw error
            }
        }
    })

    const { data: users } = useQuery<KindeUser[], Error>({
        queryKey: ["kinde-users"],
        queryFn: async () => {
            try {
                const response = await authenticatedFetch("/api/admin/users")
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || `Failed to fetch users (${response.status})`)
                }
                return response.json()
            } catch (error) {
                if (error instanceof AuthenticationError) {
                    logout()
                }
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
                if (error instanceof AuthenticationError) {
                    logout()
                }
                throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-calendars"] })
            setDeleteDialogOpen(false)
            setCalendarToDelete(null)
        }
    })

    const assignUserMutation = useMutation({
        mutationFn: async ({ year, kindeUserId }: { year: number; kindeUserId: string | null }) => {
            try {
                const response = await authenticatedFetch(`/api/admin/calendars/${year}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ kindeUserId })
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to assign user")
                }
                return response.json()
            } catch (error) {
                if (error instanceof AuthenticationError) {
                    logout()
                }
                throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-calendars"] })
        }
    })

    const handleUserAssignment = (year: number, kindeUserId: string | null) => {
        assignUserMutation.mutate({ year, kindeUserId })
    }

    const handleDeleteClick = (calendar: Calendar) => {
        setCalendarToDelete(calendar)
        setDeleteDialogOpen(true)
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
                                        <FormControl size="small" sx={{ minWidth: 200 }}>
                                            <Select
                                                value={calendar.kindeUserId || ""}
                                                onChange={(e) =>
                                                    handleUserAssignment(
                                                        calendar.year,
                                                        e.target.value === "" ? null : e.target.value
                                                    )
                                                }
                                                displayEmpty
                                                disabled={assignUserMutation.isPending}
                                            >
                                                <MenuItem value="">
                                                    <em>Unassigned</em>
                                                </MenuItem>
                                                {users?.map((user) => (
                                                    <MenuItem key={user.id} value={user.id}>
                                                        {user.fullName} ({user.email})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
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
