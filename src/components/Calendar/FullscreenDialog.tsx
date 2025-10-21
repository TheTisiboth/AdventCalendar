import Dialog from "@mui/material/Dialog"
import List from "@mui/material/List"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import CloseIcon from "@mui/icons-material/Close"
import Slide from "@mui/material/Slide"
import { TransitionProps } from "@mui/material/transitions"
import { Dispatch, FC, Ref, SetStateAction, forwardRef } from "react"
import type { PictureWithUrl } from "@actions/pictures"
import { usePicture } from "@/hooks/usePicture"

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement
    },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />
})

type DialogProps = {
    picture: PictureWithUrl
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

export const FullScreenDialog: FC<DialogProps> = ({ picture, open, setOpen }) => {
    const { imageSRC } = usePicture({ picture })

    const handleClose = () => {
        setOpen((prev) => !prev)
    }

    return (
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar sx={{ position: "relative" }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Picture {picture.day}
                    </Typography>
                </Toolbar>
            </AppBar>
            <List className="fullscreen_container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSRC} width={"100%"} alt={"Fullscreen image " + picture.day} />
            </List>
        </Dialog>
    )
}
export default FullScreenDialog
