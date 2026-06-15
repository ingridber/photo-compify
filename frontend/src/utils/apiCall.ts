import type { reportTypes } from "../services/reportApi";
import { getCsrfToken } from "./csrfToken";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export async function apiCall(path: string, method: HttpMethod = "GET", body?: Record<string, unknown> | FormData | reportTypes): Promise<Response> {
    const BASE_URL = import.meta.env.VITE_API_URL;
    if (!BASE_URL) throw new Error("VITE_API_URL is not defined");
    const isFormData = body instanceof FormData;
    const headers: HeadersInit = {
        "x-csrf-token": getCsrfToken(),
        ...(!isFormData && { "Content-Type": "application/json" }),
    };
    return await fetch(`${BASE_URL}${path}`, {
        method: method,
        credentials: "include",
        headers: headers,
        body: isFormData ? body : JSON.stringify(body)
    });
};
