import { useContext, useEffect } from "react";
import { GlobalContext } from "../context";

export const useFetchInterceptor = () => {
    const { jwt } = useContext(GlobalContext)
    const { fetch: originalFetch } = window;
    useEffect(() => {
        console.log(jwt)

    }, [jwt])
    window.fetch = async (...args) => {
        console.log("init")
        console.log(jwt)

        let [resource, options] = args;



        const headers = options?.headers ? new Headers(options.headers) : new Headers();

        if (options && options.headers && !headers.has("Authorization"))
            headers.set("Authorization", `Bearer ${jwt}`);


        const response = await originalFetch(resource, options);
        return response;
    };
}