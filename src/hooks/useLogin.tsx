import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState, SyntheticEvent, useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { User } from "../types/types";
import { TypeOf, object, string } from "zod";
import { GlobalContext } from "../context";
import { useAPI } from "./useAPI";

const loginSchema = object({
    name: string()
        .nonempty('Name is required'),
    password: string()
        .nonempty('Password is requiredd')
})

type LoginInput = TypeOf<typeof loginSchema>;

export const useLogin = () => {
    const { setUser, setAuthorized } = useContext(GlobalContext)
    const navigate = useNavigate()
    const { login } = useAPI()

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
        if (isSubmitSuccessful) {
            navigate({ to: "/calendar" })
        }
    }, [isSubmitSuccessful]);


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