export async function apiCall(path: string, method: string = "GET", body?: Object): Promise<Response> {
    const BASE_URL = import.meta.env.VITE_API_URL;
    return await fetch(`${BASE_URL}${path}`, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
};
