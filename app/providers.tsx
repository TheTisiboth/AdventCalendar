"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { Alert, Box, Snackbar } from "@mui/material"
import { NavBar } from "@/components/NavBar"
import { useSnackBarStore } from "@/store"
import { useMainHook } from "@/hooks/useMainHook"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "offlineFirst"
      },
      mutations: {
        networkMode: "offlineFirst"
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </LocalizationProvider>
    </QueryClientProvider>
  )
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  useMainHook()
  const { open, message, severity, handleClose } = useSnackBarStore("open", "message", "severity", "handleClose")

  return (
    <>
      <NavBar />
      <Box
        sx={{
          paddingTop: 9,
          paddingLeft: 1,
          paddingRight: 1
        }}
      >
        {children}
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  )
}
