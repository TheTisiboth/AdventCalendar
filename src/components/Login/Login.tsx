import { Box, Grid, Typography } from "@mui/material"
import { FormProvider } from "react-hook-form"
import { LoadingButton } from "@mui/lab"
import FormInput from "./FormInput"
import { useLogin } from "@/hooks/useLogin"
import FormCheckbox from "./FormCheckbox"

const Login = () => {
    const { methods, loading, handleSubmit } = useLogin()

    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "100vh", marginTop: -20 }}
        >
            <Grid item xs={0} sm={4} />
            <Grid item xs={12} sm={4}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ mb: "2rem" }}>
                        Sign In
                    </Typography>
                    <FormProvider {...methods}>
                        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit()}>
                            <FormInput name="name" required fullWidth label="Name" sx={{ mb: 2 }} />

                            <FormInput
                                name="password"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                sx={{ mb: 2 }}
                            />
                            <FormCheckbox name="rememberMe" label="Remember me" sx={{ mb: 2 }} />
                            <LoadingButton
                                variant="contained"
                                fullWidth
                                type="submit"
                                loading={loading}
                                sx={{ py: "0.8rem", mt: "1rem" }}
                            >
                                Sign In
                            </LoadingButton>
                        </Box>
                    </FormProvider>
                </Box>
            </Grid>
        </Grid>
    )
}

export default Login
