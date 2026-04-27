import { createContext } from "react";
import type { UserContextType } from "../types/user";

export const UserContext = createContext<UserContextType | undefined>(undefined);