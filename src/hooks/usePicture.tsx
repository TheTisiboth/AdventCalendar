import { Dispatch, RefObject, SetStateAction, useState, useTransition } from "react"
import dayjs from "dayjs"
import { useCalendarStore, useResponsiveStore } from "@/store"
import type { PictureWithUrl } from "@actions/pictures"
import { openPicture as openPictureAction } from "@actions/pictures"

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
    isPending: boolean
}
export const usePicture = ({ picture, imageRef }: UsePictureProps): UsePictureReturn => {
    const { isMobile } = useResponsiveStore("isMobile")
    const { date } = useCalendarStore("date")
    const [isPending, startTransition] = useTransition()

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
            // Use server action with React 19 useTransition for optimistic UI
            startTransition(async () => {
                try {
                    await openPictureAction(picture.day, picture.year)
                } catch (error) {
                    console.error("Failed to open picture:", error)
                }
            })
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
        imageSRC,
        isPending
    }
}
