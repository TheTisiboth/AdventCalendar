import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { NETLIFY_FUNcTIONS_PATH } from "../constants"

export const Home: FC = () => {

    const fetchComments = async () => {
        const response = await fetch(NETLIFY_FUNcTIONS_PATH + "get_comments")
        return response.json()
    }

    const fetchPictures = async () => {
        const response = await fetch(NETLIFY_FUNcTIONS_PATH + "get_pictures")
        return response.json()
    }

    const { data, isLoading, isError } = useQuery({ queryKey: ["comments"], queryFn: fetchComments })
    const { data: pictures, isLoading: isPictureLoading } = useQuery<string[]>({ queryKey: ["pictures"], queryFn: fetchPictures })

    return (
        <div className="App">

            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures && pictures.map((pic, index) => <img key={index} src={pic} width={"10%"} />)}

            {isLoading && <p>Loading comments...</p>}
            {!isLoading && data && data.map((comment: any) => <p key={comment._id}>{comment.name}</p>)}

        </div>
    )
}