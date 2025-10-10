"use client"

import { Button, Paper, Skeleton } from "@mui/material"
import { FC, useRef } from "react"
import type { Picture } from "@prisma/client"
import FullScreenDialog from "./FullscreenDialog"
import { usePicture } from "@/hooks/usePicture"
import "./Day.css"
import {  useResponsiveStore } from "@/store"

type DayProps = {
    picture: Picture
    isArchived?: boolean
}
export const Day: FC<DayProps> = ({ picture, isArchived = false }) => {
    const imageRef = useRef<HTMLImageElement>(null)
    const { imageSize } = useResponsiveStore("imageSize")
    const { open, setOpen, isToday, isBefore, handleClick, textColor, divColor, imageSRC } = usePicture({
        picture,
        imageRef
    })

    // For archived calendars, all pictures are viewable
    const canView = isArchived || isBefore || isToday
    const shouldShowImage = canView && picture.isOpen

    return (
        <Button disabled={!canView} fullWidth style={{ height: imageSize, width: imageSize }} onClick={handleClick}>
            <Paper elevation={10} style={{ width: "100%", height: "100%" }} className={`${divColor} paperPicture`}>
                {shouldShowImage && (
                    <img ref={imageRef} src={imageSRC} className="image" alt={"Image " + picture.day} />
                )}

                <span className={`text-overlay ${textColor}`}>{picture.day} </span>

                {isToday && !isArchived && !picture.isOpen && (
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={"100%"}
                        style={{ backgroundColor: "blue", borderRadius: 4, zIndex: 50 }}
                    />
                )}

                <FullScreenDialog picture={picture} setOpen={setOpen} open={open} />
            </Paper>
        </Button>
    )
}
