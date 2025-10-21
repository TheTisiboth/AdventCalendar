import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCalendarStore, useSnackBarStore } from "@/store"
import { getPictures, getFakePictures, openPicture as openPictureAction, resetPictures as resetPicturesAction, type PictureWithUrl } from "@actions/pictures"

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
      // In fake mode, just reset the local state (no database)
      if (isFake) {
        // Reset all pictures to closed state
        queryClient.setQueryData<PictureWithUrl[]>(
          queryKey,
          (oldPics) => oldPics?.map((pic) => ({ ...pic, isOpen: false }))
        )
        return
      }

      await resetPicturesAction(year)
      queryClient.invalidateQueries({ queryKey })
    } catch (error) {
      handleClick(error instanceof Error ? error.message : "Server error")
    }
  }

  const openPictureMutation = async (day: number) => {
    // In fake mode, don't call the server action (no database)
    if (isFake) {
      return null
    }

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
      // Restore old state (only if not in fake mode)
      if (!isFake) {
        queryClient.setQueryData<PictureWithUrl[]>(queryKey, context?.oldPics)
      }
    },
    onSettled: () => {
      // In fake mode, don't invalidate (we don't want to refetch)
      // The optimistic update is the final state
      if (!isFake) {
        queryClient.invalidateQueries({ queryKey })
      }
    }
  })

  const fetchPictures = async () => {
    try {
      // Use fake pictures for test mode, real pictures otherwise
      if (isFake) {
        return await getFakePictures(year)
      }
      return await getPictures(year)
    } catch (error) {
      console.error("Failed to fetch pictures:", error)
      return []
    }
  }

  const { data: pictures, isLoading: isPictureLoading } = useQuery<PictureWithUrl[]>({
    queryFn: fetchPictures,
    queryKey,
    // Only enable the query if we're not in fake mode OR if isFake is explicitly set
    // This prevents the query from running before isFake is properly initialized
    staleTime: isFake ? Infinity : 0, // Fake data never goes stale
  })

  return {
    resetPictures,
    openPicture: mutate,
    pictures,
    isPictureLoading
  }
}
