import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NETLIFY_FUNCTIONS_PATH } from "../constants";
import { useContext } from "react";
import { GlobalContext } from "../context";
import { Picture } from "../types/types";

export const useAPI = () => {
    const queryClient = useQueryClient();
    const { isFake } = useContext(GlobalContext)

    const resetPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "reset_pictures")
        if (response.ok)
            queryClient.invalidateQueries({ queryKey: ["pictures"] });
    }

    const refreshToken = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "refresh_token", {
            credentials: "include"
        })
        return response.json()
    }

    const openPicture = async (day: number) => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "open_picture?" + new URLSearchParams({
            day: day.toString()
        }), {
            method: "POST", body: JSON.stringify({ test: isFake })
        })
        return response.json()
    }

    const { mutate } = useMutation(openPicture, {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["pictures"] });
            queryClient.setQueryData(['pictures', { id: variables }], data)
        }
    });

    const login = async (name: string, password: string) => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "login", { method: "POST", body: JSON.stringify({ name, password }) })
        return response
    }

    const fetchPictures = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "get_pictures", {
            method: "POST", body: JSON.stringify({ test: isFake })
        })
        return response.json()
    }

    const { data: pictures, isLoading: isPictureLoading, } = useQuery<Picture[]>({ queryKey: ["pictures"], queryFn: fetchPictures })

    return {
        resetPictures,
        refreshToken,
        openPicture: mutate,
        login,
        fetchPictures: {
            pictures, isPictureLoading
        }
    }
}