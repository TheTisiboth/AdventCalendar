import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState, SyntheticEvent, useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { User } from "../types/types";
import { TypeOf, boolean, object, string } from "zod";
import { GlobalContext } from "../context";
import { useAPI } from "./useAPI";
import { useLocation } from "react-router-dom";

const loginSchema = object({
    name: string()
        .nonempty('Name is required'),
    password: string()
        .nonempty('Password is requiredd'),
    rememberMe: boolean().optional()
})

type LoginInput = TypeOf<typeof loginSchema>;

export const useLogin = () => {
    const { setUser, setAuthorized, setJWT, authorized } = useContext(GlobalContext)
    const navigate = useNavigate()
    const { login } = useAPI()
    const location = useLocation()

    const [loading, setLoading] = useState(false);

    const [snackBar, setSnackBar] = useState({
        open: false,
        severity: "error"
    })

    const methods = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const {
        handleSubmit: submit,
        setError,
        formState: { isSubmitSuccessful },
    } = methods;

    const handleClick = (severity: string) => {
        setSnackBar(prevState => ({
            ...prevState,
            open: true,
            severity
        }))
    };

    const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBar(prevState => ({
            ...prevState,
            open: false,
        }))
    };


    useEffect(() => {
        if (isSubmitSuccessful || authorized) {
            const origin = location.state?.from?.pathname || '/calendar';
            navigate({ to: origin })
        }
    }, [isSubmitSuccessful, authorized]);


    const onSubmitHandler: SubmitHandler<LoginInput> = async (values) => {
        setLoading(true)
        const response = await login(values.name, values.password)
        const data = await response.json()
        if (!response.ok) {
            setError("root", { message: data.message as string }, { shouldFocus: true })
            handleClick("error")
            setLoading(false)
            return
        }
        setUser(data.user as User)
        setAuthorized(true)
        handleClick("success")
        setJWT(data.accessToken as string)
        if (values.rememberMe)
            localStorage.setItem("jwt", data.accessToken)
    };

    const handleSubmit = () => submit(onSubmitHandler)

    return {
        methods,
        snackBar,
        loading,
        handleSubmit,
        handleClose
    }
}