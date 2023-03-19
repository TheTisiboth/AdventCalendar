import './App.css'
import { RouterProvider } from '@tanstack/react-router'
import { router } from "./router"

// Register your router for maximum type safety
declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}
export const App = () =>
(
  <>
    <RouterProvider router={router} />
  </>
)
