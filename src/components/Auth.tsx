import { Navigate, Outlet } from "@tanstack/react-router";
import { FC, useContext } from "react";
import { GlobalContext } from "../context";

export const Auth: FC = () => {
    const context = useContext(GlobalContext)
    if (!context.authorized) {
        return <Navigate to="/login" />;
    }
    return <Outlet />;
}