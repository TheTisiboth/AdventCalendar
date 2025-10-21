import { Dispatch, RefObject, SetStateAction, useState } from "react"
import dayjs from "dayjs"
import { usePictureAPI } from "./api/usePictureAPI"
import { useCalendarStore, useResponsiveStore } from "@/store"
import type { PictureWithUrl } from "@actions/pictures"

type UsePictureProps = {
    picture: PictureWithUrl
    imageRef?: RefObject<HTMLImageElement | null>
}

type UsePictureReturn = {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    isBefore: boolean
    isToday: boolean
    handleClick: () => void
    textColor: string
    divColor: string
    imageSRC: string
}
export const usePicture = ({ picture, imageRef }: UsePictureProps): UsePictureReturn => {
    const { isMobile } = useResponsiveStore("isMobile")
    const { date } = useCalendarStore("date")
    const { openPicture } = usePictureAPI({ year: picture.year })

    const [open, setOpen] = useState(false)
    const isBefore = dayjs(picture.date).isBefore(dayjs(date))
    const isToday = dayjs(date).isSame(dayjs(picture.date), "day")
    // Use signed URL from picture object
    const imageSRC = picture.url

    const computeTextColor = (): string => {
        if (isBefore || isToday) {
            if (picture.isOpen) return "textIsAfter"
            return "textIsBefore"
        }
        return "textIsAfter"
    }

    const computeDivColor = (): string => {
        if (isBefore) {
            if (picture.isOpen) return "isOpen"
            if (!isToday) return "isBefore"
        }
        return ""
    }

    const handleClick = () => {
        if (!picture.isOpen) {
            openPicture(picture.day)
        } else {
            togglePictureFullscreen()
        }
    }

    const togglePictureFullscreen = async () => {
        if (isMobile) {
            if (!open) setOpen((prev) => !prev)
        } else {
            void imageRef?.current?.requestFullscreen()
        }
    }

    const textColor = computeTextColor()
    const divColor = computeDivColor()

    return {
        open,
        setOpen,
        isBefore,
        isToday,
        handleClick,
        textColor,
        divColor,
        imageSRC
    }
}
