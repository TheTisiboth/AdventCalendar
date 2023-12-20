import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { NETLIFY_FUNCTIONS_PATH } from "../constants"
import { useContext } from "react"
import { GlobalContext } from "../context"
import { LoginResponse, Picture } from "../types/types"

const QUERY_KEY = "pictures"

export const useAPI = () => {
    const queryClient = useQueryClient()
    const { isFake, jwt: stateJWT } = useContext(GlobalContext)
    const localJWT = localStorage.getItem("jwt")
    const jwt = localJWT ?? stateJWT
    const headers: HeadersInit = jwt ? { Authorization: `Bearer ${jwt}` } : {}
    const queryKey = [QUERY_KEY, isFake]

    // Wrapper function that performs api calls
    const api = async <T,>(url: string, init?: RequestInit | undefined): Promise<T> => {
        return fetch(url, init).then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            return response.json() as Promise<T>
        })
    }

    const resetPictures = async () => {
        try {
            await api(NETLIFY_FUNCTIONS_PATH + "reset_pictures")
            queryClient.invalidateQueries({ queryKey })
        } catch (e) {
            console.log(e)
        }
    }

    const openPicture = async (day: number) => {
        const openPicturePath = isFake ? "open_fake_picture" : "open_picture"

        try {
            return await api<Picture>(
                NETLIFY_FUNCTIONS_PATH +
                    `${openPicturePath}?` +
                    new URLSearchParams({
                        day: day.toString()
                    })
            )
        } catch (e) {
            console.log(e)
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

    const login = async (name: string, password: string) => {
        return await api<LoginResponse>(NETLIFY_FUNCTIONS_PATH + "login", {
            method: "POST",
            body: JSON.stringify({ name, password })
        })
    }

    const fetchPictures = async () => {
        const getPicturePath = isFake ? "get_fake_pictures" : "get_pictures"
        try {
            return await api<Picture[]>(NETLIFY_FUNCTIONS_PATH + getPicturePath, { headers })
        } catch (e) {
            return []
        }
    }

    const authenticate = async () => {
        return await api(NETLIFY_FUNCTIONS_PATH + "authenticate", { headers })
    }

    const { data: pictures, isLoading: isPictureLoading } = useQuery<Picture[]>({
        queryFn: fetchPictures,
        queryKey
    })

    return {
        resetPictures,
        openPicture: mutate,
        login,
        fetchPictures: {
            pictures,
            isPictureLoading
        },
        authenticate
    }
}
