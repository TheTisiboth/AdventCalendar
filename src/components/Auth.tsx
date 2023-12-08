import { Navigate, Outlet } from "@tanstack/react-router";
import { FC, useContext } from "react";
import { GlobalContext } from "../context";

export const Auth: FC = () => {
    const { authorized } = useContext(GlobalContext)
    if (!authorized) {
        return <Navigate to="/login" />;
    }
    return <Outlet />;
}