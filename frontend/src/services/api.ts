// ---------- LOG IN ----------
// ----------------------------
export async function login(email: string, password: string) {
    const res = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: email, password: password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
}

// ---------- REGISTER ----------
// ------------------------------
export async function register(email: string, username: string, password: string,) {
    
    const res = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email: email,
            username: username,
            password: password,
        }),
    });

    return res;
}

// ---------- FETCH COMPETITIONS ----------
// ----------------------------------------
export async function fetchCompetitions() {
    const res = await fetch("http://localhost:3000/api/v1/competitions");

    if (!res.ok) {
        throw new Error(`Failed to fetch competitions: ${res.status} ${res.statusText}`);
    }

    return await res.json();

}


// ---------- UPDATE USERNAME ----------
// -------------------------------------
export async function updateUsername(username: string) {

    const res = await fetch("http://localhost:3000/api/v1/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            newUsername: username 
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
}


// const res = await fetch("http://localhost:3000/api/v1/user/username", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include", // 👈
//         body: JSON.stringify({ newUsername: username }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);