type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export async function apiCall(path: string, method: HttpMethod = "GET", body?: Record<string, unknown> | FormData): Promise<Response> {
    const BASE_URL = import.meta.env.VITE_API_URL;
    if (!BASE_URL) throw new Error("VITE_API_URL is not defined");
    const isFormData = body instanceof FormData;
    const headers: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
    try {
        return await fetch(`${BASE_URL}${path}`, {
            method: method,
            credentials: "include",
            headers: headers,
            body: isFormData ? body : JSON.stringify(body)
        });
    } catch (error) {
        throw error;
    }
};
