// eslint-disable-next-line import/named
import { AlertColor } from "@mui/material"
import { useState } from "react"

export const useSnackbar = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState<AlertColor>("error")

    const handleClick = (message: string, severity: AlertColor = "error") => {
        setMessage(message)
        setSeverity(severity)
        setOpen(true)
    }

    const handleClose = (_event: React.SyntheticEvent | Event, _reason?: string) => {
        setOpen(false)
    }

    return {
        handleClick,
        handleClose,
        open,
        message,
        severity,
        setSeverity
    }
}
