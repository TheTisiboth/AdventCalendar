import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { NETLIFY_FUNcTIONS_PATH } from "../constants"
import reactLogo from '../assets/react.svg'

export const Home: FC = () => {

    const fetchRbnb = async () => {
        const response = await fetch(NETLIFY_FUNcTIONS_PATH + "get_rbnb")
        return response.json()
    }

    const fetchPictures = async () => {
        const response = await fetch(NETLIFY_FUNcTIONS_PATH + "get_pictures")
        return response.json()
    }

    const { data, isLoading, isError } = useQuery({ queryKey: ["rbnb"], queryFn: fetchRbnb })
    const { data: pictures, isLoading: isPictureLoading } = useQuery<string[]>({ queryKey: ["pic"], queryFn: fetchPictures })

    return (
        <div className="App">

            {isPictureLoading && <p>Loading pic...</p>}
            {!isPictureLoading && pictures && pictures.map((pic, index) => <img key={index} src={pic} width={"10%"} />)}

            {isLoading && <p>Loading rbnb...</p>}
            {!isLoading && data && data.map((rbnb: any) => <p key={rbnb.name}>{rbnb.name}</p>)}

        </div>
    )
}