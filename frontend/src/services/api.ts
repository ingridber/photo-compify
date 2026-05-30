import type { Competition, Submission } from "../types/competitions";

const BASE_URL: string = "http://localhost:3000/api/v1";

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

        const data = await res.json();

        return data;

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

    if (!res.ok) {
        throw new Error('Logout failed');
    }

    return res;
};

// ---------- REGISTER ----------
// ------------------------------
export async function register(email: string, username: string, password: string,confirmPassword: string,  token: string) {

    const res = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email: email,
            username: username,
            password: password,
            confirmPassword: confirmPassword,
            recaptchaToken: token,
        }),
    });

    return res;
};

// ---------- FETCH COMPETITIONS ----------
// ----------------------------------------
type FetchCompetitionsParams = {
    page?: number;
    limit?: number;
    status?: "submission" | "voting" | "ended";
    search?: string;
    themes?: string[];
};

// const BASE_URL = "http://localhost:3000/api/v1";

export async function fetchCompetitions(params?: FetchCompetitionsParams) {
    const query = new URLSearchParams();

    if (params?.page) {
        query.append("page", params.page.toString());
    }

    if (params?.status) {
        query.append("status", params.status);
    }

    if (params?.search) {
        query.append("search", params.search);
    }

    if (params?.themes?.length) {
        query.append("themes", params.themes.join(","));
    }

    if (params?.limit) {
        query.append("limit", params.limit.toString());
    }

    const res = await fetch(
        `${BASE_URL}/competitions?${query.toString()}`
    );

    if (!res.ok) {
        throw new Error(
            `Failed to fetch competitions: ${res.status} ${res.statusText}`
        );
    }
    return await res.json()
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


// ---------- UPDATE PROFILE PIC ----------
// ----------------------------------------
export async function updateProfilePicture(
    profilePicture: string,
    oldProfilePicture?: string) {

    const res = await fetch("http://localhost:3000/api/v1/user/profilePicture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            profilePicture,
            oldProfilePicture
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to upload profile picture")
    }

    return;
}

export async function fetchCompetitionById(id: string,): Promise<Competition> {
    const res = await fetch(`${BASE_URL}/competitions/${id}`, {credentials: "include"});

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(
            error?.message ?? `Failed to fetch competition (${res.status})`,
        );
    }

    return res.json();
}

export async function createSubmission(
    competitionId: string,
    imageId: string,
): Promise<Submission> {
    const res = await fetch(
        `${BASE_URL}/competitions/${competitionId}/submissions`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageId }),
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to create submission (${res.status})`);
    }

    return res.json();
}

export async function voteOnSubmission(submissionId: string): Promise<void> {
    const res = await fetch(
        `${BASE_URL}/submissions/${submissionId}/vote`,
        {
            method: "POST",
            credentials: "include",
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to vote (${res.status})`);
    }
}

export async function removeVote(submissionId: string): Promise<void> {
    const res = await fetch(
        `${BASE_URL}/submissions/${submissionId}/vote`,
        {
            method: "DELETE",
            credentials: "include",
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to remove vote (${res.status})`);
    }
}
// ---------- DELETE PROFILE PIC ----------
// ----------------------------------------
export async function deleteProfilePicture() {

    return fetch("http://localhost:3000/api/v1/user/profilePicture", {
        method: "DELETE",
        credentials: "include"
    });
};


// ---------- GET USER COMPS ----------
// ------------------------------------

export async function getUserComps() {
    const res = await fetch(
    "http://localhost:3000/api/v1/user/competitions",
    {
        credentials: "include",
    }
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);

        throw new Error(
            error?.message ?? "Failed to fetch user competitions"
        );
    }

    return await res.json();
}




// ---------- GET USER SUBMITS ----------
// --------------------------------------

export async function getUserSubmits() {
        const res = await fetch(
        "http://localhost:3000/api/v1/user/submissions",
        {
            credentials: "include",
        }
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);

        throw new Error(
            error?.message ?? "Failed to fetch user submissions"
        );
    }

    return await res.json();
}


// ---------- GET USER STATS ----------
// ------------------------------------

export async function getUserStats() {

    const res = await fetch(
        "http://localhost:3000/api/v1/user/stats",
        {
            credentials: "include"
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch stats");
    }

    return await res.json();
}



// ---------- UPDATE USER DETAILS ----------
// -----------------------------------------
export async function updateUserDetails(
    camera?: string,
    themes?: string[]) {

    const res = await fetch("http://localhost:3000/api/v1/user/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            camera,
            themes
        }),

    });

    if (!res.ok) {
        throw new Error("Failed to update user details")
    }

    return await res.json();
    }
