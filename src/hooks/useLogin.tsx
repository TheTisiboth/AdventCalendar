import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { useState, SyntheticEvent, useEffect, useContext } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { TypeOf, boolean, object, string } from "zod"
import { GlobalContext } from "../context"
import { useAPI } from "./useAPI"
import { useLocation } from "react-router-dom"

const loginSchema = object({
    name: string().nonempty("Name is required"),
    password: string().nonempty("Password is requiredd"),
    rememberMe: boolean().optional().default(false)
})

type LoginInput = TypeOf<typeof loginSchema>

export const useLogin = () => {
    const { setUser, isLoggedIn, setIsLoggedIn, setJWT } = useContext(GlobalContext)
    const navigate = useNavigate()
    const { login } = useAPI()
    const location = useLocation()

    const [loading, setLoading] = useState(false)

    const [snackBar, setSnackBar] = useState({
        open: false,
        severity: "error"
    })

    const methods = useForm<LoginInput>({
        resolver: zodResolver(loginSchema)
    })

    const {
        handleSubmit: submit,
        setError,
        formState: { isSubmitSuccessful }
    } = methods

    const handleClick = (severity: string) => {
        setSnackBar((prevState) => ({
            ...prevState,
            open: true,
            severity
        }))
    }

    const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return
        }

        setSnackBar((prevState) => ({
            ...prevState,
            open: false
        }))
    }

    useEffect(() => {
        if (isSubmitSuccessful || isLoggedIn) {
            const origin = location.state?.from?.pathname || "/calendar"
            navigate({ to: origin })
        }
    }, [isSubmitSuccessful, isLoggedIn])

    // const handleSuccessfulLogin = (data: any) => {}

    const onSubmitHandler: SubmitHandler<LoginInput> = async (values) => {
        setLoading(true)
        try {
            const response = await login(values.name, values.password)
            setUser(response.user)
            setIsLoggedIn(true)
            handleClick("success")
            setJWT(response.accessToken)
            if (values.rememberMe) localStorage.setItem("jwt", response.accessToken)
        } catch (e) {
            setLoading(false)
            if (e instanceof Error) {
                setError("root", { message: e.message }, { shouldFocus: true })
                handleClick("error")
                return
            } else {
                console.log(e)
            }
        }
    }

    const handleSubmit = () => submit(onSubmitHandler)

    return {
        methods,
        snackBar,
        loading,
        handleSubmit,
        handleClose
    }
}
