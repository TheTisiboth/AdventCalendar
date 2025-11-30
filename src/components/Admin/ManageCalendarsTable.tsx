"use client"

import { useState, useTransition } from "react"
import {
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
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { adminDeleteCalendar, adminDuplicateCalendar } from "@actions/admin"
import type { Calendar } from "@prisma/client"

type CalendarWithCount = Calendar & { pictureCount: number }

type KindeUser = {
    id: string
    email: string
    fullName: string
}

type ManageCalendarsTableProps = {
    calendars: CalendarWithCount[]
    users: KindeUser[]
}

export function ManageCalendarsTable({ calendars, users }: ManageCalendarsTableProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [calendarToDelete, setCalendarToDelete] = useState<CalendarWithCount | null>(null)

    const handleDeleteClick = (calendar: CalendarWithCount) => {
        setCalendarToDelete(calendar)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (!calendarToDelete) return

        startTransition(async () => {
            try {
                await adminDeleteCalendar(calendarToDelete.id)
                setDeleteDialogOpen(false)
                setCalendarToDelete(null)
                router.refresh()
            } catch (error) {
                console.error("Failed to delete calendar:", error)
            }
        })
    }

    const handleDuplicate = (id: number) => {
        startTransition(async () => {
            try {
                await adminDuplicateCalendar(id)
                router.refresh()
            } catch (error) {
                console.error("Failed to duplicate calendar:", error)
            }
        })
    }

    const getUserDisplayName = (kindeUserId: string | null): string => {
        if (!kindeUserId) return "Unassigned"
        const user = users?.find((u) => u.id === kindeUserId)
        return user ? user.email : "Unknown User"
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setCalendarToDelete(null)
    }

    return (
        <>
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

            {calendars && calendars.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Calendar</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Pictures</TableCell>
                                <TableCell>Assigned User</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calendars.map((calendar) => (
                                <TableRow key={calendar.id}>
                                    <TableCell>{calendar.year} - {calendar.title}</TableCell>
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
                                                onClick={() => router.push(`/admin/manage/edit/${calendar.id}`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<ContentCopyIcon />}
                                                onClick={() => handleDuplicate(calendar.id)}
                                                disabled={isPending}
                                            >
                                                Duplicate
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDeleteClick(calendar)}
                                                disabled={isPending}
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
                        Are you sure you want to delete &quot;{calendarToDelete?.year} - {calendarToDelete?.title}&quot;?
                        This will permanently delete all {calendarToDelete?.pictureCount} pictures from storage.
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
