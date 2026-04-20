// ---------- LOGIN ----------

export async function login(email: string, password: string) {
    const res = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password: password })
    });

    if (!res.ok) {
        throw new Error('Login failed');
    };

    return res.json();

};

export async function register(email: string, username: string, password: string) {
    const res = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, username: username, password: password }),
    });

    return res
}
