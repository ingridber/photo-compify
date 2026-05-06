import { Navigate, useLocation } from "react-router";
import { useUser } from "../hooks/useUser";
import type { ReactNode } from "react";

export function ProtectedRoute({children}: {children: ReactNode}) {
    const {user} = useUser();
    const location = useLocation();

    if(!user) {
        return <Navigate to="/login" state={{ from: location }} replace/>;
    }

    return children;
}