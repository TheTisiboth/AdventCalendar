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
    CircularProgress
} from "@mui/material"
import { useRouter, useParams } from "next/navigation"
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

export default function EditCalendar() {
    const router = useRouter()
    const params = useParams()
    const year = Number(params.year)

    const [existingPictures, setExistingPictures] = useState<ExistingPicture[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        setIsSubmitting(true)
        setError(null)

        try {
            const jwt = localStorage.getItem("jwt")
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

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box>
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
                            <Typography variant="h6" gutterBottom>
                                Pictures ({existingPictures.length}/24)
                            </Typography>
                            {existingPictures.length < 24 && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    This calendar has {existingPictures.length} pictures. 24 pictures are required to publish.
                                </Alert>
                            )}
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Picture management (add/remove/reorder) will be available in a future update.
                                Currently, you can only edit calendar metadata.
                            </Alert>
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
                                                    <Typography variant="body2">
                                                        Day {picture.day}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {picture.key}
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
                                    {isSubmitting ? "Saving..." : "Save Changes"}
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
