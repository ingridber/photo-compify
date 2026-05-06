import type { Dispatch, SetStateAction } from "react";

export type User = {
    username: string;
    profilePicture?: {
        _id: string;
        url: string;
    } | null;
};

export type UserContextType = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
};