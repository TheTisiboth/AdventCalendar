import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NETLIFY_FUNCTIONS_PATH } from "../constants";
import { useContext } from "react";
import { GlobalContext } from "../context";
import { Picture } from "../types/types";

const QUERY_KEY = "pictures"

export const useAPI = () => {
    const queryClient = useQueryClient();
    const { isFake, jwt: stateJWT } = useContext(GlobalContext)
    const localJWT = localStorage.getItem("jwt")
    const jwt = localJWT ?? stateJWT
    const headers: HeadersInit = jwt ? { 'Authorization': `Bearer ${jwt}` } : {};

    const resetPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "reset_pictures")
        if (response.ok)
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, isFake] });
    }

    const refreshToken = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "refresh_token", {
            credentials: "include"
        })
        return response.json()
    }

    const openPicture = async (day: number) => {
        const openPicturePath = isFake ? "open_fake_picture" : "open_picture"

        const response = await fetch(NETLIFY_FUNCTIONS_PATH + `${openPicturePath}?` + new URLSearchParams({
            day: day.toString()
        }))
        return response.json()
    }

    const { mutate } = useMutation(openPicture, {
        onMutate: async (newPicDay) => {
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY, isFake] })

            // Snapshot the previous value
            const oldPics = queryClient.getQueryData<Picture[]>([QUERY_KEY, isFake]);

            // Perform optimistic update on the relevant picture
            queryClient.setQueryData<Picture[]>([QUERY_KEY, isFake], (oldPics) =>
                oldPics?.map((oldPic) => (oldPic.day === newPicDay ? { ...oldPic, isOpen: true } : oldPic))
            );

            // Return a context object with the snapshotted value
            return { oldPics }
        },
        onError: (_err, _newPicDay, context) => {
            // Restore old state
            queryClient.setQueryData<Picture[]>([QUERY_KEY, isFake], context?.oldPics)
        },
        onSettled: () => {
            // Invalidate the queries, so all the Pictures will be refetched
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, isFake] })
        },
    });

    const login = async (name: string, password: string) => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "login", { method: "POST", body: JSON.stringify({ name, password }) })
        return response
    }

    const fetchPictures = async () => {
        const getPicturePath = isFake ? "get_fake_pictures" : "get_pictures"
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + getPicturePath, { headers })
        if (response.ok)
            return response.json()
    }

    const authenticate = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "authenticate", { headers })
        return response
    }

    const { data: pictures, isLoading: isPictureLoading } = useQuery<Picture[]>({ queryKey: [QUERY_KEY, isFake], queryFn: fetchPictures })

    return {
        resetPictures,
        refreshToken,
        openPicture: mutate,
        login,
        fetchPictures: {
            pictures, isPictureLoading
        },
        authenticate
    }
}