import type { Competition, Submission } from "../types/competitions";
import { apiCall } from "../utils/apiCall";

// ---------- LOG IN ----------
export async function login(username: string, password: string) {
    return await apiCall("/auth/login", "POST", { username: username, password: password });
};

// ---------- GET CURRENT USER ----------
export async function getCurrentUser() {
    try {
        const res = await apiCall("/auth/me", "GET");

        if (res.status === 401) {
            return null;
        };

        if (!res.ok) {
            throw new Error("Failed to fetch user");
        };

        const data = await res.json();

        return data;

    } catch (err) {
        throw new Error('Something went wrong')
    };
};

// ---------- LOG OUT ----------
export async function logout() {
    const res = await apiCall("/user/logout", "POST");

    if (!res.ok) {
        throw new Error('Logout failed');
    }
    sessionStorage.clear();

    return res;
};

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

// ---------- FETCH COMPETITIONS ----------
type FetchCompetitionsParams = {
    page?: number;
    limit?: number;
    status?: "submission" | "voting" | "ended";
    search?: string;
    themes?: string[];
};

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

    const res = await apiCall(
        `/competitions?${query.toString()}`, "GET"
    );

    if (!res.ok) {
        throw new Error(
            `Failed to fetch competitions: ${res.status} ${res.statusText}`
        );
    }
    return await res.json()
}

// ---------- UPDATE USERNAME ----------
export async function updateUsername(username: string) {
    const res = await apiCall("/user/username", "PATCH", {
        newUsername: username
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

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

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
};

// ---------- DELETE ACCOUNT ----------
export async function deleteAccount(
    password: string,) {

    const res = await apiCall("/user/", "DETELE", {
        password: password,
    });

    return res;
}

// ---------- UPDATE PROFILE PIC ----------
export async function updateProfilePicture(
    profilePicture: string,
    oldProfilePicture?: string) {

    const res = await apiCall("/user/profilePicture", "PATCH", {
        profilePicture,
        oldProfilePicture
    });

    if (!res.ok) {
        throw new Error("Failed to upload profile picture")
    }

    return;
}

export async function fetchCompetitionById(id: string,): Promise<Competition> {
    const res = await apiCall(`/competitions/${id}`, "GET");

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
    const res = await apiCall(
        `/competitions/${competitionId}/submissions`, "POST",
        {
            imageId
        },
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to create submission (${res.status})`);
    }

    return res.json();
}

export async function voteOnSubmission(submissionId: string): Promise<void> {
    const res = await apiCall(
        `/submissions/${submissionId}/vote`, "POST"
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to vote (${res.status})`);
    }
}

export async function removeVote(submissionId: string): Promise<void> {
    const res = await apiCall(
        `/submissions/${submissionId}/vote`, "DELETE"
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to remove vote (${res.status})`);
    }
}
// ---------- DELETE PROFILE PIC ----------
export async function deleteProfilePicture() {
    return await apiCall("/user/profilePicture", "DELETE");
}

// ---------- GET USER COMPS ----------
export async function getUserComps() {
    const res = await apiCall("/user/competitions");

    if (!res.ok) {
        const error = await res.json().catch(() => null);

        throw new Error(
            error?.message ?? "Failed to fetch user competitions"
        );
    }

    return await res.json();
}

// ---------- GET USER SUBMITS ----------
export async function getUserSubmits() {
    const res = await apiCall("/user/submissions");

    if (!res.ok) {
        const error = await res.json().catch(() => null);

        throw new Error(
            error?.message ?? "Failed to fetch user submissions"
        );
    }

    return await res.json();
}

// ---------- GET USER STATS ----------
export async function getUserStats() {
    const res = await apiCall("/user/stats");

    if (!res.ok) {
        throw new Error("Failed to fetch stats");
    }
    return await res.json();
}

// ---------- UPDATE USER DETAILS ----------
export async function updateUserDetails(
    camera?: string,
    themes?: string[]) {

    const res = await apiCall("/user/edit", "PATCH", {
        camera,
        themes
    });
    if (!res.ok) {
        throw new Error("Failed to update user details")
    }
    return await res.json();
}
