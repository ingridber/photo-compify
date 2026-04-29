import { Navigate } from "react-router";
import { useUser } from "../hooks/useUser";
import type { ReactNode } from "react";

export function ProtectedRoute({children}: {children: ReactNode}) {
    const {user} = useUser();

    if(!user) {
        return <Navigate to="/" replace/>;
    }

    return children;
}