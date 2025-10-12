import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Picture } from "@prisma/client"
import { API_BASE_PATH } from "@/constants"
import { useCalendarStore, useSnackBarStore } from "@/store"
import { api } from "./baseAPI"

const QUERY_KEY = "pictures"

type UsePictureAPIProps = {
  year: number
}

/**
 * Hook for picture-related API operations
 * Handles fetching, opening, and resetting pictures for a specific year
 */
export const usePictureAPI = ({ year }: UsePictureAPIProps) => {
  const queryClient = useQueryClient()
  const { isFake } = useCalendarStore("isFake")
  const { handleClick } = useSnackBarStore("handleClick")

  const queryKey = [QUERY_KEY, isFake, year]

  const resetPictures = async () => {
    try {
      await api(API_BASE_PATH + "reset_pictures")
      queryClient.invalidateQueries({ queryKey })
    } catch (e) {
      handleClick("Server error")
    }
  }

  const openPicture = async (day: number) => {
    const openPicturePath = isFake ? "open_fake_picture" : "open_picture"
    try {
      const params = new URLSearchParams({
        day: day.toString(),
        year: year.toString()
      })

      return await api<Picture>(
        API_BASE_PATH + `${openPicturePath}?` + params
      )
    } catch (e) {
      handleClick("Server error")
    }
  }

  const { mutate } = useMutation(openPicture, {
    onMutate: async (newPicDay) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const oldPics = queryClient.getQueryData<Picture[]>(queryKey)

      // Perform optimistic update on the relevant picture
      queryClient.setQueryData<Picture[]>(
        queryKey,
        (oldPics) => oldPics?.map((oldPic) => (oldPic.day === newPicDay ? { ...oldPic, isOpen: true } : oldPic))
      )

      // Return a context object with the snapshotted value
      return { oldPics }
    },
    onError: (_err, _newPicDay, context) => {
      // Restore old state
      queryClient.setQueryData<Picture[]>(queryKey, context?.oldPics)
    },
    onSettled: () => {
      // Invalidate the queries, so all the Pictures will be refetched
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const fetchPictures = async () => {
    const getPicturePath = isFake ? "get_fake_pictures" : "get_pictures"
    try {
      const url = API_BASE_PATH + getPicturePath + "?" + new URLSearchParams({ year: year.toString() })
      return await api<Picture[]>(url)
    } catch (e) {
      return []
    }
  }

  const { data: pictures, isLoading: isPictureLoading } = useQuery<Picture[]>({
    queryFn: fetchPictures,
    queryKey
  })

  return {
    resetPictures,
    openPicture: mutate,
    pictures,
    isPictureLoading
  }
}
