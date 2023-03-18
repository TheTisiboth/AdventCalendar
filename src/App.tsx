import './App.css'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  Link,
  Router,
  Route,
  RootRoute,
} from '@tanstack/react-router'

import { router } from "./router"
// Register your router for maximum type safety
declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}
function App() {
  return (<>
    <RouterProvider router={router} />
  </>
  )
}

export default App
