import { Navigate, useLocation } from "react-router";
import { useUser } from "../hooks/useUser";
import type { ReactNode } from "react";
import { Throbber } from "./user-feedback/Throbber";

export function ProtectedRoleRoute({children}: {children: ReactNode}) {
    const {user, loading} = useUser();
    const location = useLocation();

    if(loading) {return <Throbber/>;}
    if(!user) { return <Navigate to="/login" state={{ from: location }} replace/>;}
    if(user.role !== "admin") {return <Navigate to="/notFound" state={{ from: location }} replace/>;}

    return children;
}