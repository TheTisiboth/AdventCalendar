import { API_BASE_PATH } from "@/constants"
import { LoginResponse } from "@/types/types"
import { useAuthStore } from "@/store"
import { api, getAuthHeaders } from "./baseAPI"

/**
 * Hook for authentication-related API operations
 * Handles login and token authentication
 */
export const useAuthAPI = () => {
  const { jwt: stateJWT } = useAuthStore("jwt")

  const localJWT = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null
  const jwt = localJWT ?? stateJWT
  const headers: HeadersInit = getAuthHeaders(jwt)

  const login = async (name: string, password: string) => {
    return await api<LoginResponse>(API_BASE_PATH + "login", {
      method: "POST",
      body: JSON.stringify({ name, password })
    })
  }

  const authenticate = async () => {
    return await api(API_BASE_PATH + "authenticate", { headers })
  }

  return {
    login,
    authenticate
  }
}
