import type { Dispatch, SetStateAction } from "react";

export type User = {
    username: string;
    profilePicture?: string;
    // token?: string;
};

export type UserContextType = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
};