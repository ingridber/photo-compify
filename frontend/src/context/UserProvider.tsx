import { useState } from "react";
import type { ReactNode } from "react";
import { UserContext } from "./UserContext";
import type { User } from "../types/user";

export function UserProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    return (
        <UserContext.Provider 
            value={{user, setUser, loading, setLoading}}>
            {children}
        </UserContext.Provider>
    );
};