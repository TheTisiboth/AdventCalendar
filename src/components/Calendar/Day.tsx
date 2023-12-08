import { Button, Paper, Skeleton } from "@mui/material"
import { FC, useContext, useRef } from "react"
import { Picture } from "../../types/types"
import FullScreenDialog from "./FullscreenDialog"
import { usePicture } from "../../hooks/usePicture"
import './Day.css'
import { GlobalContext } from "../../context"

type DayProps = {
    picture: Picture
}
export const Day: FC<DayProps> = ({ picture }) => {
    const imageRef = useRef<HTMLImageElement>(null)
    const { imageSize } = useContext(GlobalContext)
    const { open, setOpen, isToday, isBefore, handleClick, textColor, divColor, imageSRC } = usePicture({ picture, imageRef })

    return (
        <Button disabled={!isBefore} fullWidth style={{ height: imageSize, width: imageSize }} onClick={handleClick} >
            <Paper elevation={10} style={{ width: "100%", height: "100%", }} className={`${divColor} paperPicture`}>
                {isBefore && picture.isOpen &&
                    < img ref={imageRef} src={imageSRC} max-width={"100%"} max-height={"100%"} className="image" />
                }

                <span className={`text-overlay ${textColor}`}>{picture.day} </span>

                {isToday && !picture.isOpen &&
                    <Skeleton variant="rectangular" width={"100%"} height={"100%"} style={{ backgroundColor: "blue", borderRadius: 4, zIndex: 50 }} />
                }

                <FullScreenDialog picture={picture} setOpen={setOpen} open={open} />

            </Paper>
        </Button >
    )
}
