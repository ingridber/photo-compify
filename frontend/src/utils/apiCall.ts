export async function apiCall(path: string, method: string = "GET", body?: Object | FormData): Promise<Response> {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const isFormData = body instanceof FormData;
    const headers: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
    return await fetch(`${BASE_URL}${path}`, {
        method: method,
        credentials: "include",
        headers: headers,
        body: isFormData ? body : JSON.stringify(body)
    });
};
