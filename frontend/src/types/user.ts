import type { Dispatch, SetStateAction } from "react";
import type { Competition, Submission } from "./competitions";


export type User = {
    _id: string;
    username: string;
    profilePicture?: {
        _id: string;
        url: string;
    } | null;
};

export type UserContextType = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

export type PublicProfile = {
    user: {
        _id: string;
        username: string;
        profilePicture?: {
            url?: string;
        };
        camera: string;
        themes: string[];
    };

    stats: {
        wins: number;
        submissions: number;
        competitionsCreated: number;
    };

    submissions: Submission[];

    competitions: Competition[];
};