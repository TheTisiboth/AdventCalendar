"use client"

import { useState, useEffect } from "react"
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    FormControlLabel,
    Checkbox,
    Alert,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    IconButton,
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
import Grid from "@mui/material/Grid"
import { useRouter, useParams } from "next/navigation"
import DeleteIcon from "@mui/icons-material/Delete"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getKindeUsers, adminGetCalendar, adminUpdateCalendar, adminUploadPictures, adminDeletePicture } from "@actions/admin"

const calendarSchema = z.object({
    year: z.number().min(2020).max(2100),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    isPublished: z.boolean(),
    kindeUserId: z.string().nullable().optional(),
    pictureCount: z.number().optional()
}).refine(
    (data) => {
        // If published, must have exactly 24 pictures
        return !(data.isPublished && data.pictureCount !== 24);
    },
    {
        message: "Cannot publish calendar with less than 24 pictures. Save as draft (unpublished) instead.",
        path: ["isPublished"]
    }
)

type CalendarFormData = z.infer<typeof calendarSchema>

type ExistingPicture = {
    id: number
    day: number
    key: string
    url: string
}

type NewPictureWithPreview = {
    file: File
    day: number
    preview: string
}

type KindeUser = {
    id: string
    email: string
    fullName: string
}

export default function EditCalendar() {
    const router = useRouter()
    const params = useParams()
    const queryClient = useQueryClient()
    const year = Number(params.year)

    const [newPictures, setNewPictures] = useState<NewPictureWithPreview[]>([])
    const [error, setError] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pictureToDelete, setPictureToDelete] = useState<ExistingPicture | null>(null)

    const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery<KindeUser[], Error>({
        queryKey: ["kinde-users"],
        queryFn: getKindeUsers
    })

    const { data: calendar, isLoading, error: calendarError } = useQuery({
        queryKey: ["admin-calendar", year],
        queryFn: () => adminGetCalendar(year)
    })

    const existingPictures = calendar?.pictures || []

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CalendarFormData>({
        resolver: zodResolver(calendarSchema),
        defaultValues: {
            year,
            title: "",
            description: "",
            isPublished: true,
            kindeUserId: null
        }
    })

    // Update form when calendar data is loaded
    useEffect(() => {
        if (calendar) {
            reset({
                year: calendar.year,
                title: calendar.title,
                description: calendar.description || "",
                isPublished: calendar.isPublished,
                kindeUserId: calendar.kindeUserId || null,
                pictureCount: calendar.pictures?.length || 0
            })
        }
    }, [calendar, reset])

    const updateMutation = useMutation({
        mutationFn: (data: CalendarFormData) => adminUpdateCalendar(year, {
            title: data.title,
            description: data.description,
            isPublished: data.isPublished,
            kindeUserId: data.kindeUserId
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-calendar", year] })
            queryClient.invalidateQueries({ queryKey: ["admin-calendars"] })
        }
    })

    const uploadMutation = useMutation({
        mutationFn: (pictures: Array<{ day: number; file: File }>) => adminUploadPictures({ year, pictures }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-calendar", year] })
            queryClient.invalidateQueries({ queryKey: ["admin-calendars"] })
            setNewPictures([])
        }
    })

    const deleteMutation = useMutation({
        mutationFn: adminDeletePicture,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-calendar", year] })
            queryClient.invalidateQueries({ queryKey: ["admin-calendars"] })
            setDeleteDialogOpen(false)
            setPictureToDelete(null)
        }
    })

    const onSubmit = async (data: CalendarFormData) => {
        // Block saving if published is checked but calendar has < 24 pictures (including new ones)
        const totalPictures = existingPictures.length + newPictures.length
        if (totalPictures < 24 && data.isPublished) {
            setError("Cannot save: Calendar has only " + totalPictures + " pictures. Uncheck 'Published' to save as draft, or add more pictures to publish.")
            return
        }

        setError(null)

        try {
            // First, upload any new pictures if they exist
            if (newPictures.length > 0) {
                await uploadMutation.mutateAsync(
                    newPictures.map(pic => ({ day: pic.day, file: pic.file }))
                )
            }

            // Then, update the calendar metadata
            await updateMutation.mutateAsync(data)

            router.push("/admin/manage")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update calendar")
        }
    }

    const handleDeleteClick = (picture: ExistingPicture) => {
        setPictureToDelete(picture)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (!pictureToDelete) return
        deleteMutation.mutate(pictureToDelete.id)
    }

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false)
        setPictureToDelete(null)
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const currentTotal = existingPictures.length + newPictures.length
        const availableSlots = 24 - currentTotal

        if (availableSlots === 0) {
            setError("Cannot add more pictures. Calendar already has 24 pictures.")
            event.target.value = ""
            return
        }

        if (files.length > availableSlots) {
            setError(`Can only add ${availableSlots} more picture${availableSlots > 1 ? 's' : ''}. You selected ${files.length}.`)
            event.target.value = ""
            return
        }

        const usedDays = new Set([
            ...existingPictures.map((p) => p.day),
            ...newPictures.map((p) => p.day)
        ])

        const newPicturesArray: NewPictureWithPreview[] = []

        Array.from(files).forEach((file) => {
            // Find next available day
            let nextDay = 1
            while (usedDays.has(nextDay) && nextDay <= 24) {
                nextDay++
            }

            if (nextDay <= 24) {
                newPicturesArray.push({
                    file,
                    day: nextDay,
                    preview: URL.createObjectURL(file)
                })
                usedDays.add(nextDay)
            }
        })

        setNewPictures((prev) => [...prev, ...newPicturesArray])
        // Reset file input
        event.target.value = ""
    }

    const handleNewPictureDayChange = (index: number, newDay: number) => {
        const updated = [...newPictures]
        updated[index].day = newDay
        setNewPictures(updated)
    }

    const handleRemoveNewPicture = (index: number) => {
        const updated = newPictures.filter((_, i) => i !== index)
        setNewPictures(updated)
    }

    const totalPictureCount = existingPictures.length + newPictures.length
    const availableDays = Array.from({ length: 24 }, (_, i) => i + 1)
    const isSubmitting = updateMutation.isPending || uploadMutation.isPending
    const isDeleting = deleteMutation.isPending

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        )
    }

    if (calendarError || !calendar) {
        return (
            <Box>
                <Typography variant="h5" color="error">
                    Failed to load calendar
                </Typography>
                <Button onClick={() => router.push("/admin/manage")}>
                    Back to Manage
                </Button>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push("/admin/manage")}
                >
                    Back to Manage
                </Button>
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Edit Calendar {year}
            </Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                {...register("year", { valueAsNumber: true })}
                                label="Year"
                                type="number"
                                fullWidth
                                disabled
                                error={!!errors.year}
                                helperText={errors.year?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                {...register("title")}
                                label="Title"
                                fullWidth
                                error={!!errors.title}
                                helperText={errors.title?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                {...register("description")}
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth error={!!errors.kindeUserId}>
                                <InputLabel>Assigned User</InputLabel>
                                <Select
                                    {...register("kindeUserId")}
                                    label="Assigned User"
                                    defaultValue=""
                                    disabled={isLoadingUsers}
                                >
                                    <MenuItem value="">
                                        <em>Unassigned</em>
                                    </MenuItem>
                                    {isLoadingUsers && (
                                        <MenuItem disabled>
                                            <em>Loading users...</em>
                                        </MenuItem>
                                    )}
                                    {!isLoadingUsers && users && users.length === 0 && (
                                        <MenuItem disabled>
                                            <em>No users available</em>
                                        </MenuItem>
                                    )}
                                    {users?.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {usersError && (
                                    <Typography color="error" variant="caption" sx={{ display: "block", mt: 1 }}>
                                        Failed to load users: {usersError.message}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={<Checkbox {...register("isPublished")} />}
                                label="Published (requires 24 pictures)"
                            />
                            {errors.isPublished && (
                                <Typography color="error" variant="caption" sx={{ display: "block", ml: 2 }}>
                                    {errors.isPublished.message}
                                </Typography>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Typography variant="h6">
                                    Pictures ({totalPictureCount}/24)
                                    {newPictures.length > 0 && (
                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                            ({existingPictures.length} saved + {newPictures.length} new)
                                        </Typography>
                                    )}
                                </Typography>
                                {totalPictureCount < 24 && (
                                    <Typography variant="caption" color="text.secondary">
                                        Note: 24 pictures required for published calendars. Save as draft to continue with fewer pictures.
                                    </Typography>
                                )}
                            </Box>
                            {totalPictureCount < 24 && (
                                <Button variant="contained" component="label" disabled={isDeleting || isSubmitting}>
                                    Add Pictures
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            )}
                            {newPictures.length > 0 && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    You have {newPictures.length} new picture(s) ready. Click &#34;Save Changes&#34; to upload and save them.
                                </Alert>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Grid container spacing={2}>
                                {existingPictures
                                    .sort((a, b) => a.day - b.day)
                                    .map((picture) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={picture.id}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={picture.url}
                                                    alt={`Day ${picture.day}`}
                                                />
                                                <CardContent>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                Day {picture.day}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {picture.key}
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteClick(picture)}
                                                            disabled={isDeleting || isSubmitting}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                {newPictures.map((picture, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`new-${index}`}>
                                        <Card sx={{ border: "2px dashed", borderColor: "primary.main" }}>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={picture.preview}
                                                alt={`New Day ${picture.day}`}
                                            />
                                            <CardContent>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                                        <InputLabel>Day</InputLabel>
                                                        <Select
                                                            value={picture.day}
                                                            label="Day"
                                                            onChange={(e) => handleNewPictureDayChange(index, Number(e.target.value))}
                                                        >
                                                            {availableDays.map((day) => (
                                                                <MenuItem key={day} value={day}>
                                                                    {day}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveNewPicture(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {picture.file.name}
                                                </Typography>
                                                <Typography variant="caption" color="primary" sx={{ display: "block" }}>
                                                    (Not uploaded yet)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        {error && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? (newPictures.length > 0 ? "Uploading & Saving..." : "Saving...")
                                        : (newPictures.length > 0 ? `Upload ${newPictures.length} Picture${newPictures.length > 1 ? "s" : ""} & Save` : "Save Changes")
                                    }
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push("/admin/manage")}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Delete Picture</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the picture for Day {pictureToDelete?.day}?
                        This will permanently delete the picture from storage.
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
