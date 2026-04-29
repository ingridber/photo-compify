// ---------- LOG IN ----------
// ----------------------------
export async function login(username: string, password: string) {
    const res = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: username, password: password }),
    });

    return res;
};

// ---------- GET CURRENT USER ----------
// --------------------------------------
export async function getCurrentUser() {
    try {
        const res = await fetch("http://localhost:3000/api/v1/auth/me", {
            credentials: "include",
        });

        if (res.status === 401) {
            return null;
        };

        if (!res.ok) {
            throw new Error("Failed to fetch user");
        };

        return await res.json();

    } catch (err) {
        console.log(err);
        return null;
    };
};

// ---------- LOG OUT ----------
// -----------------------------
export async function logout() {
    const res = await fetch("http://localhost:3000/api/v1/user/logout", {
        method: "POST",
        credentials: "include",
    });

    if(!res.ok) {
        throw new Error('Logout failed');
    }

    return res;
};

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
};

// ---------- FETCH COMPETITIONS ----------
// ----------------------------------------
export async function fetchCompetitions() {
    const res = await fetch("http://localhost:3000/api/v1/competitions");

    if (!res.ok) {
        throw new Error(`Failed to fetch competitions: ${res.status} ${res.statusText}`);
    }

    return await res.json();
};

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
};

// ---------- UPDATE PASSWORD ----------
// -------------------------------------
export async function updatePassword(
    password: string, 
    newPassword: string, 
    confirmPassword: string) {

    const res = await fetch("http://localhost:3000/api/v1/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            password: password,
            newPassword: newPassword,
            confirmPassword: confirmPassword 
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
};

// ---------- DELETE ACCOUNT ----------
// ------------------------------------
export async function deleteAccount(
    password: string,) {

    const res = await fetch("http://localhost:3000/api/v1/user/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            password: password,
        }),
    });

    return res;
}