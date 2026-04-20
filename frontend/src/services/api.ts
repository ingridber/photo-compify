// ---------- LOGIN ----------

export async function login(email: string, password: string) {
    const res = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username: email, password: password})
    });

    const data = await res.json();

    if(!res.ok) {
        throw new Error(data.message);
    };

    return data;
    
};
