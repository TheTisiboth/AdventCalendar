import {
    Alert,
    Box,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Snackbar,
    Typography,
} from '@mui/material';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { literal, object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import Checkbox from '@mui/material/Checkbox';
import FormInput from '../components/FormInput';
import { GlobalContext } from '../context';
import { useNavigate } from '@tanstack/react-router';
import { NETLIFY_FUNCTIONS_PATH } from '../constants';
import { DBUser, User } from '../types/types';
import { useQuery } from '@tanstack/react-query';
import { isEmpty } from "lodash";

const loginSchema = object({
    name: string()
        .nonempty('Name is required'),
    password: string()
        .nonempty('Password is requiredd')
})

type LoginInput = TypeOf<typeof loginSchema>;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const context = useContext(GlobalContext)
    const [snackBar, setSnackBar] = useState({
        open: false,
        severity: "error"
    })
    const handleClick = (severity: string) => {
        setSnackBar(prevState => ({
            ...prevState,
            open: true,
            severity
        }))
    };

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBar(prevState => ({
            ...prevState,
            open: false,
        }))
    };
    const navigate = useNavigate()
    const methods = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const {
        reset,
        handleSubmit,
        register,
        setError,
        formState: { isSubmitSuccessful, errors },
    } = methods;

    useEffect(() => {
        console.log(isSubmitSuccessful)
        if (isSubmitSuccessful) {
            // reset();
            console.log("navigate")
            navigate({ to: "/calendar" })
        }
    }, [isSubmitSuccessful]);


    const login = async (name: string, password: string) => {
        const response = await fetch(NETLIFY_FUNCTIONS_PATH + "login", { method: "POST", body: JSON.stringify({ name, password }) })
        console.log("response", response)
        return response
    }

    const onSubmitHandler: SubmitHandler<LoginInput> = async (values) => {
        console.log("onSubmitHandler")
        const response = await login(values.name, values.password)
        console.log("res", response)
        const data = await response.json()
        if (!response.ok) {
            setError("root", { message: data.message as string }, { shouldFocus: true })
            handleClick("error")

            return
        }
        context.setUser(data.user as User)
        context.setAuthorized(true)
        handleClick("success")

        // console.log("error", error)
        // set same error in both:
        // setError('name', { type: "server", message: "Username may be incorrect" })
        // setError('password', { type: "server", message: "Password may be incorrect" })
        // throw new Error("test")
    };

    console.log(errors);
    return (
        <Box sx={{
            maxWidth: '30rem',
            margin: "auto",
            width: "50 %",
            padding: "100px"
        }}>
            <Typography variant='h4' component='h1' sx={{ mb: '2rem' }}>
                Sign In
            </Typography>
            <FormProvider {...methods}>
                <Box
                    component='form'
                    noValidate
                    autoComplete='off'
                    onSubmit={handleSubmit(onSubmitHandler)}
                >
                    <FormInput
                        name='name'
                        required
                        fullWidth
                        label='Name'
                        sx={{ mb: 2 }}
                    />

                    <FormInput
                        name='password'
                        required
                        fullWidth
                        label='Password'
                        type='password'
                        sx={{ mb: 2 }}
                    />


                    <LoadingButton
                        variant='contained'
                        fullWidth
                        type='submit'
                        loading={loading}
                        sx={{ py: '0.8rem', mt: '1rem' }}
                    >
                        Sign In
                    </LoadingButton>
                </Box>
            </FormProvider>
            <Snackbar open={snackBar.open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} >
                <Alert onClose={handleClose} severity={(isEmpty(errors) || errors.root) ? "error" : "success"} sx={{ width: '100%' }}>
                    {errors.root && errors.root.message}
                    {isSubmitSuccessful && "User authentified"}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Login;
