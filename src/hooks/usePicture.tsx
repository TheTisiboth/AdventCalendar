import { Dispatch, RefObject, SetStateAction, useContext, useState } from "react";
import { CDN_URL } from "../constants";
import { GlobalContext } from "../context";
import { Picture } from "../types/types";
import dayjs from "dayjs";
import { useAPI } from "./useAPI";

type UsePictureProps = {
    picture: Picture,
    imageRef?: RefObject<HTMLImageElement>,
}

type UsePictureReturn = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    isBefore: boolean,
    isToday: boolean,
    handleClick: () => void,
    textColor: string,
    divColor: string,
    imageSRC: string
}
export const usePicture = ({ picture, imageRef }: UsePictureProps): UsePictureReturn => {
    const { date, isMobile } = useContext(GlobalContext)
    const { openPicture } = useAPI()

    const [open, setOpen] = useState(false);
    const isBefore = dayjs(picture.date).isBefore(dayjs(date))
    const isToday = dayjs(date).isSame(dayjs(picture.date), "day")
    const imageSRC = (picture.key.split(".jpg").length === 2) ? CDN_URL + picture.key : picture.key

    const computeTextColor = (): string => {
        if (isBefore) {
            if (picture.isOpen)
                return "textIsAfter"
            return "textIsBefore"
        }
        return "textIsAfter"
    }

    const computeDivColor = (): string => {
        if (isBefore) {
            if (picture.isOpen)
                return "isOpen"
            if (!isToday)
                return "isBefore"
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
            if (!open)
                setOpen((prev) => !prev)
        } else {
            try {
                await imageRef?.current?.requestFullscreen();
            } catch (error) {
                console.log(error)
            }
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