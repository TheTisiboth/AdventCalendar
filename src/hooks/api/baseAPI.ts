/**
 * Base API utility function
 * Wrapper that performs API calls with error handling
 */
export const api = async <T,>(url: string, init?: RequestInit | undefined): Promise<T> => {
  return fetch(url, init).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json() as Promise<T>
  })
}
