import { useState } from "react";
import type { ReactNode } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState('');

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};