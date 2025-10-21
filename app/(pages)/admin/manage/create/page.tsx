"use client"

import { useState } from "react"
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    FormControlLabel,
    Checkbox,
    Alert,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material"
import Grid from "@mui/material/Grid"
import { useRouter } from "next/navigation"
import DeleteIcon from "@mui/icons-material/Delete"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { authenticatedFetch } from "@/utils/api"

type KindeUser = {
    id: string
    email: string
    fullName: string
}

const calendarSchema = z.object({
    year: z.number().min(2020).max(2100),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    kindeUserId: z.string().nullable().optional(),
    isPublished: z.boolean(),
    pictures: z
        .array(
            z.object({
                file: z.instanceof(File),
                day: z.number().min(1).max(24)
            })
        )
        .min(1, "At least one picture is required")
        .max(24, "Maximum 24 pictures allowed")
        .refine(
            (pictures) => {
                const days = pictures.map((p) => p.day)
                const uniqueDays = new Set(days)
                return uniqueDays.size === pictures.length
            },
            {
                message: "Each picture must be assigned to a unique day"
            }
        )
}).refine(
    (data) => {
        // If published, must have exactly 24 pictures
        if (data.isPublished && data.pictures.length !== 24) {
            return false
        }
        return true
    },
    {
        message: "Published calendars must have exactly 24 pictures. Save as draft (unpublished) to continue with fewer pictures.",
        path: ["pictures"]
    }
)

type CalendarFormData = z.infer<typeof calendarSchema>

type PictureWithPreview = {
    file: File
    day: number
    preview: string
}

export default function CreateCalendar() {
    const router = useRouter()
    const [pictures, setPictures] = useState<PictureWithPreview[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery<KindeUser[], Error>({
        queryKey: ["kinde-users"],
        queryFn: async () => {
            try {
                const response = await authenticatedFetch("/api/admin/users")
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to fetch users")
                }
                const data = await response.json()
                return data
            } catch (error) {
                throw error
            }
        }
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<CalendarFormData>({
        resolver: zodResolver(calendarSchema),
        defaultValues: {
            year: new Date().getFullYear(),
            title: "",
            description: "",
            kindeUserId: null,
            isPublished: false,
            pictures: []
        }
    })

    const kindeUserId = watch("kindeUserId")

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const availableSlots = 24 - pictures.length

        if (availableSlots === 0) {
            setError("Cannot add more pictures. Maximum 24 pictures allowed.")
            event.target.value = ""
            return
        }

        if (files.length > availableSlots) {
            setError(`Can only add ${availableSlots} more picture${availableSlots > 1 ? 's' : ''}. You selected ${files.length}.`)
            event.target.value = ""
            return
        }

        const newPictures: PictureWithPreview[] = []

        // Try to preserve selection order and auto-assign days
        Array.from(files).forEach((file) => {
            // Find next available day
            const usedDays = new Set([...pictures.map(p => p.day), ...newPictures.map(p => p.day)])
            let nextDay = 1
            while (usedDays.has(nextDay) && nextDay <= 24) {
                nextDay++
            }

            if (nextDay <= 24) {
                newPictures.push({
                    file,
                    day: nextDay,
                    preview: URL.createObjectURL(file)
                })
            }
        })

        const updatedPictures = [...pictures, ...newPictures]
        setPictures(updatedPictures)
        setValue(
            "pictures",
            updatedPictures.map(({ file, day }) => ({ file, day }))
        )
        // Reset file input
        event.target.value = ""
    }

    const handleDayChange = (index: number, newDay: number) => {
        const updatedPictures = [...pictures]
        updatedPictures[index].day = newDay
        setPictures(updatedPictures)
        setValue(
            "pictures",
            updatedPictures.map(({ file, day }) => ({ file, day }))
        )
    }

    const handleRemovePicture = (index: number) => {
        const updatedPictures = pictures.filter((_, i) => i !== index)
        setPictures(updatedPictures)
        setValue(
            "pictures",
            updatedPictures.map(({ file, day }) => ({ file, day }))
        )
    }

    const onSubmit = async (data: CalendarFormData) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("year", data.year.toString())
            formData.append("title", data.title)
            formData.append("description", data.description || "")
            formData.append("kindeUserId", data.kindeUserId || "")
            formData.append("isPublished", data.isPublished.toString())

            // Append pictures with their day assignments
            data.pictures.forEach((picture) => {
                formData.append(`pictures`, picture.file)
                formData.append(`days`, picture.day.toString())
            })

            const response = await authenticatedFetch("/api/admin/calendars/create", {
                method: "POST",
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create calendar")
            }

            router.push("/admin/manage")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create calendar")
        } finally {
            setIsSubmitting(false)
        }
    }

    const availableDays = Array.from({ length: 24 }, (_, i) => i + 1)

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
                Create New Calendar
            </Typography>

            {usersError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Failed to load users: {usersError.message}. You can still create calendars but won&apos;t be able to assign them to users.
                </Alert>
            )}

            <Paper sx={{ p: 3, mt: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                {...register("year", { valueAsNumber: true })}
                                label="Year"
                                type="number"
                                fullWidth
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
                            <FormControl fullWidth>
                                <InputLabel>Assign to User</InputLabel>
                                <Select
                                    value={kindeUserId || ""}
                                    label="Assign to User"
                                    onChange={(e) => setValue("kindeUserId", e.target.value === "" ? null : e.target.value)}
                                    disabled={isLoadingUsers}
                                >
                                    <MenuItem value="">
                                        <em>Unassigned (Admin only)</em>
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
                                    {!isLoadingUsers && users?.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={<Checkbox {...register("isPublished")} />}
                                label="Published (requires 24 pictures)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Typography variant="h6">
                                    Pictures ({pictures.length}/24)
                                </Typography>
                                {pictures.length < 24 && (
                                    <Typography variant="caption" color="text.secondary">
                                        Note: 24 pictures required for published calendars. Save as draft to continue with fewer pictures.
                                    </Typography>
                                )}
                            </Box>
                            {pictures.length < 24 && (
                                <Button variant="contained" component="label">
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
                            {errors.pictures && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {errors.pictures.message}
                                </Alert>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Grid container spacing={2}>
                                {pictures.map((picture, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={picture.preview}
                                                alt={`Day ${picture.day}`}
                                            />
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                                        <InputLabel>Day</InputLabel>
                                                        <Select
                                                            value={picture.day}
                                                            label="Day"
                                                            onChange={(e) =>
                                                                handleDayChange(
                                                                    index,
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                        >
                                                            {availableDays.map((day) => (
                                                                <MenuItem key={day} value={day}>
                                                                    {day}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <IconButton
                                                        onClick={() => handleRemovePicture(index)}
                                                        color="error"
                                                        size="small"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {picture.file.name}
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
                                    {isSubmitting ? "Creating..." : "Create Calendar"}
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
        </Box>
    )
}
