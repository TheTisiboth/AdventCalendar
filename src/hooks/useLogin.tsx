import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { TypeOf, boolean, object, string } from "zod"
import { useAuthAPI } from "./api/useAuthAPI"
import { useAuthStore, useSnackBarStore } from "@/store"
import { isInAdventPeriod } from "@/utils/utils"

const loginSchema = object({
    name: string().nonempty("Name is required"),
    password: string().nonempty("Password is requiredd"),
    rememberMe: boolean().optional().default(false)
})

type LoginInput = TypeOf<typeof loginSchema>

export const useLogin = () => {
    const { setUser, isLoggedIn, setIsLoggedIn, setJWT } = useAuthStore(
        "setUser",
        "isLoggedIn",
        "setJWT",
        "setIsLoggedIn"
    )
    const { handleClick } = useSnackBarStore("handleClick")
    const router = useRouter()
    const { login } = useAuthAPI()

    const [loading, setLoading] = useState(false)

    const methods = useForm<LoginInput>({
        resolver: zodResolver(loginSchema)
    })

    const {
        handleSubmit: submit,
        setError,
        formState: { isSubmitSuccessful }
    } = methods

    useEffect(() => {
        if (isSubmitSuccessful || isLoggedIn) {
            if (isInAdventPeriod()) router.push("/calendar")
            else router.push("/archive")
        }
    }, [isSubmitSuccessful, isLoggedIn, router])

    const onSubmitHandler: SubmitHandler<LoginInput> = async (values) => {
        setLoading(true)
        try {
            const response = await login(values.name, values.password)
            setUser(response.user)
            setIsLoggedIn(true)
            handleClick("User authentified successfuly", "success")
            setJWT(response.accessToken)
            if (values.rememberMe && typeof window !== "undefined") {
                localStorage.setItem("jwt", response.accessToken)
            }
        } catch (e) {
            setLoading(false)
            if (e instanceof Error) {
                setError("root", { message: e.message }, { shouldFocus: true })
                handleClick(e.message)
                return
            } else {
                handleClick(e as string)
            }
        }
    }

    const handleSubmit = () => submit(onSubmitHandler)

    return {
        methods,
        loading,
        handleSubmit
    }
}
