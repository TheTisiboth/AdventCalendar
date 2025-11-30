import { Dispatch, RefObject, SetStateAction, useState, useTransition } from "react"
import dayjs from "dayjs"
import { useCalendarStore, useResponsiveStore } from "@/store"
import type { PictureWithUrl } from "@actions/pictures"
import { openPicture as openPictureAction, openTestPicture as openTestPictureAction } from "@actions/pictures"

type UsePictureProps = {
    picture: PictureWithUrl
    imageRef?: RefObject<HTMLImageElement | null>
    isFakeMode?: boolean
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
export const usePicture = ({ picture, imageRef, isFakeMode = false }: UsePictureProps): UsePictureReturn => {
    const { isMobile } = useResponsiveStore("isMobile")
    const { date } = useCalendarStore("date")
    const [isPending, startTransition] = useTransition()

    const [open, setOpen] = useState(false)

    // In fake mode, normalize dates to same year for comparison (ignore year difference)
    // In real mode, compare full dates
    const pictureDate = dayjs(picture.date)
    const currentDate = dayjs(date)

    const normalizedPictureDate = isFakeMode
        ? pictureDate.year(currentDate.year())
        : pictureDate

    const isBefore = normalizedPictureDate.isBefore(currentDate, 'day')
    const isToday = normalizedPictureDate.isSame(currentDate, 'day')

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
                    if (isFakeMode) {
                        // For fake/test mode, use openTestPicture (only requires day)
                        await openTestPictureAction(picture.day)
                    } else {
                        // For real calendars, use openPicture (requires day and calendarId)
                        await openPictureAction(picture.day, picture.calendarId)
                    }
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
