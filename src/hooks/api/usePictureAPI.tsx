import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCalendarStore, useSnackBarStore } from "@/store"
import { getPictures, openPicture as openPictureAction, resetPictures as resetPicturesAction, type PictureWithUrl } from "@actions/pictures"

const QUERY_KEY = "pictures"

type UsePictureAPIProps = {
  year: number
}

/**
 * Hook for picture-related operations using server actions
 * Handles fetching, opening, and resetting pictures for a specific year
 */
export const usePictureAPI = ({ year }: UsePictureAPIProps) => {
  const queryClient = useQueryClient()
  const { isFake } = useCalendarStore("isFake")
  const { handleClick } = useSnackBarStore("handleClick")

  const queryKey = [QUERY_KEY, isFake, year]

  const resetPictures = async () => {
    try {
      await resetPicturesAction(year)
      queryClient.invalidateQueries({ queryKey })
    } catch (error) {
      handleClick(error instanceof Error ? error.message : "Server error")
    }
  }

  const openPictureMutation = async (day: number) => {
    try {
      return await openPictureAction(day, year)
    } catch (error) {
      handleClick(error instanceof Error ? error.message : "Server error")
      throw error
    }
  }

  const { mutate } = useMutation({
    mutationFn: openPictureMutation,
    onMutate: async (newPicDay: number) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const oldPics = queryClient.getQueryData<PictureWithUrl[]>(queryKey)

      // Perform optimistic update on the relevant picture
      queryClient.setQueryData<PictureWithUrl[]>(
        queryKey,
        (oldPics) => oldPics?.map((oldPic) => (oldPic.day === newPicDay ? { ...oldPic, isOpen: true } : oldPic))
      )

      // Return a context object with the snapshotted value
      return { oldPics }
    },
    onError: (_err: Error, _newPicDay: number, context?: { oldPics?: PictureWithUrl[] }) => {
      // Restore old state
      queryClient.setQueryData<PictureWithUrl[]>(queryKey, context?.oldPics)
    },
    onSettled: () => {
      // Invalidate the queries, so all the Pictures will be refetched
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const fetchPictures = async () => {
    try {
      return await getPictures(year)
    } catch (error) {
      console.error("Failed to fetch pictures:", error)
      return []
    }
  }

  const { data: pictures, isLoading: isPictureLoading } = useQuery<PictureWithUrl[]>({
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
