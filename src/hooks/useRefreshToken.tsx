import { NETLIFY_FUNCTIONS_PATH } from "../constants"

const useRefreshToken = () => {
    const refresh = async () => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "refresh_token", {
            credentials: "include"
        })
        return response.json()
    }
}

export default useRefreshToken