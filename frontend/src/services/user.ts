import { apiCall } from "../utils/apiCall";

// ---------- REGISTER ----------
export async function register(email: string, username: string, password: string, confirmPassword: string, token: string) {
    return await apiCall("/auth/register", "POST", {
        email: email,
        username: username,
        password: password,
        confirmPassword: confirmPassword,
        recaptchaToken: token
    });
};

// ---------- LOG IN ----------
export async function login(username: string, password: string) {
    return await apiCall("/auth/login", "POST", { username: username, password: password });
};

// ---------- GET CURRENT USER ----------
export async function getCurrentUser() {
    try {
        const res = await apiCall("/auth/me", "GET");

        if (res.status === 401) {return null;};
        if (!res.ok) {throw new Error("Failed to fetch user");};

        const data = await res.json();
        return data;

    } catch (err) {
        console.log(err);
        throw new Error('Something went wrong');
    };
};

// ---------- LOG OUT ----------
export async function logout() {
    const res = await apiCall("/user/logout", "POST");

    if (!res.ok) {throw new Error('Logout failed');}
    sessionStorage.clear();

    return res;
};

// ---------- DELETE ACCOUNT ----------
export async function deleteAccount(
    password: string,) {

    const res = await apiCall("/user/", "DETELE", {
        password: password,
    });

    return res;
}

// ---------- UPDATE USERNAME ----------
export async function updateUsername(username: string) {
    const res = await apiCall("/user/username", "PATCH", {
        newUsername: username
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.message);}

    return data;
};

// ---------- UPDATE PASSWORD ----------
export async function updatePassword(
    password: string,
    newPassword: string,
    confirmPassword: string) {

    const res = await apiCall("/user/password", "PATCH", {
        password: password,
        newPassword: newPassword,
        confirmPassword: confirmPassword
    });

    const data = await res.json();

    if (!res.ok) { throw new Error(data.message);}

    return data;
};

// ---------- UPDATE PROFILE PIC ----------
export async function updateProfilePicture(
    profilePicture: string,
    oldProfilePicture?: string) {

    const res = await apiCall("/user/profilePicture", "PATCH", {
        profilePicture,
        oldProfilePicture
    });

    if (!res.ok) {throw new Error("Failed to upload profile picture")}
    return;
}

// ---------- DELETE PROFILE PIC ----------
export async function deleteProfilePicture() {
    return await apiCall("/user/profilePicture", "DELETE");
}

// ---------- UPDATE USER DETAILS ----------
export async function updateUserDetails(
    camera?: string,
    themes?: string[]) {

    const res = await apiCall("/user/edit", "PATCH", {
        camera,
        themes
    });

    if (!res.ok) {throw new Error("Failed to update user details")}
    
    return await res.json();
}

// ---------- GET USER COMPS ----------
export async function getUserComps() {
    const res = await apiCall("/user/competitions");

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? "Failed to fetch user competitions");
    }

    return await res.json();
}

// ---------- GET USER SUBMITS ----------
export async function getUserSubmits() {
    const res = await apiCall("/user/submissions");

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? "Failed to fetch user submissions");
    }

    return await res.json();
}

// ---------- GET USER STATS ----------
export async function getUserStats() {
    const res = await apiCall("/user/stats");

    if (!res.ok) { throw new Error("Failed to fetch stats");}
    return await res.json();
}