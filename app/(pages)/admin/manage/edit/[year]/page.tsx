"use client"

import { useState, useEffect } from "react"
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
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
import { useRouter, useParams } from "next/navigation"
import DeleteIcon from "@mui/icons-material/Delete"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const calendarSchema = z.object({
    year: z.number().min(2020).max(2100),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    isPublished: z.boolean(),
    isArchived: z.boolean(),
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

export default function EditCalendar() {
    const router = useRouter()
    const params = useParams()
    const year = Number(params.year)

    const [existingPictures, setExistingPictures] = useState<ExistingPicture[]>([])
    const [newPictures, setNewPictures] = useState<NewPictureWithPreview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pictureToDelete, setPictureToDelete] = useState<ExistingPicture | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
            isArchived: false
        }
    })

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const jwt = localStorage.getItem("jwt")
                const response = await fetch(`/api/admin/calendars/${year}`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch calendar")
                }

                const data = await response.json()

                // Set form values
                reset({
                    year: data.year,
                    title: data.title,
                    description: data.description || "",
                    isPublished: data.isPublished,
                    isArchived: data.isArchived,
                    pictureCount: data.pictures?.length || 0
                })

                // Set existing pictures
                setExistingPictures(data.pictures || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load calendar")
            } finally {
                setIsLoading(false)
            }
        }

        fetchCalendar()
    }, [year, reset])

    const onSubmit = async (data: CalendarFormData) => {
        // Block saving if published is checked but calendar has < 24 pictures (including new ones)
        const totalPictures = existingPictures.length + newPictures.length
        if (totalPictures < 24 && data.isPublished) {
            setError("Cannot save: Calendar has only " + totalPictures + " pictures. Uncheck 'Published' to save as draft, or add more pictures to publish.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const jwt = localStorage.getItem("jwt")

            // First, upload any new pictures if they exist
            if (newPictures.length > 0) {
                const formData = new FormData()

                newPictures.forEach((picture) => {
                    formData.append("pictures", picture.file)
                    formData.append("days", picture.day.toString())
                })

                const uploadResponse = await fetch(`/api/admin/calendars/${year}/pictures`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    },
                    body: formData
                })

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json()
                    throw new Error(errorData.error || "Failed to upload pictures")
                }
            }

            // Then, update the calendar metadata
            const response = await fetch(`/api/admin/calendars/${year}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update calendar")
            }

            router.push("/admin/manage")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update calendar")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (picture: ExistingPicture) => {
        setPictureToDelete(picture)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!pictureToDelete) return

        setIsDeleting(true)
        setError(null)

        try {
            const jwt = localStorage.getItem("jwt")
            const response = await fetch(`/api/admin/calendars/${year}/pictures/${pictureToDelete.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to delete picture")
            }

            // Remove picture from state
            setExistingPictures((prev) => prev.filter((p) => p.id !== pictureToDelete.id))
            setDeleteDialogOpen(false)
            setPictureToDelete(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete picture")
        } finally {
            setIsDeleting(false)
        }
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

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
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
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                {...register("title")}
                                label="Title"
                                fullWidth
                                error={!!errors.title}
                                helperText={errors.title?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
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
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={<Checkbox {...register("isArchived")} />}
                                label="Archived"
                            />
                        </Grid>

                        <Grid item xs={12}>
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

                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                {existingPictures
                                    .sort((a, b) => a.day - b.day)
                                    .map((picture) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={picture.id}>
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
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={`new-${index}`}>
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
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}

                        <Grid item xs={12}>
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
