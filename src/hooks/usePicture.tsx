import { Dispatch, RefObject, SetStateAction, useContext, useState } from "react"
import { CDN_URL } from "../constants"
import { Picture } from "../types/types"
import dayjs from "dayjs"
import { useAPI } from "./useAPI"
import { useCalendarStore, useResponsiveStore } from "../store"

type UsePictureProps = {
    picture: Picture
    imageRef?: RefObject<HTMLImageElement>
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
    const [isMobile] = useResponsiveStore((state) => [state.isMobile])
    const [date] = useCalendarStore((state) => [state.date])
    const { openPicture } = useAPI()

    const [open, setOpen] = useState(false)
    const isBefore = dayjs(picture.date).isBefore(dayjs(date))
    const isToday = dayjs(date).isSame(dayjs(picture.date), "day")
    const imageSRC = picture.key.includes(".jpg") || picture.key.includes(".png") ? CDN_URL + picture.key : picture.key

    const computeTextColor = (): string => {
        if (isBefore) {
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
