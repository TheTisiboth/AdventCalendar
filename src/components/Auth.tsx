import { Navigate, Outlet } from "@tanstack/react-router";
import { FC, useContext } from "react";
import { GlobalContext } from "../context";
import { useLocation } from "react-router-dom";

export const Auth: FC = () => {
    const location = useLocation()
    const { authorized } = useContext(GlobalContext)
    if (!authorized) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
}