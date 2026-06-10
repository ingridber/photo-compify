import type { Competition, Submission } from "../types/competitions";
import { apiCall } from "../utils/apiCall";

// ---------- FETCH ALL COMPETITIONS ----------
type FetchCompetitionsParams = {
    page?: number;
    limit?: number;
    status?: "submission" | "voting" | "ended";
    search?: string;
    themes?: string[];
};

export async function fetchCompetitions(params?: FetchCompetitionsParams) {
    const query = new URLSearchParams();

    if (params?.page) {query.append("page", params.page.toString());}
    if (params?.status) {query.append("status", params.status);}
    if (params?.search) {query.append("search", params.search);}
    if (params?.themes?.length) {query.append("themes", params.themes.join(","));}
    if (params?.limit) {query.append("limit", params.limit.toString());}

    const res = await apiCall(`/competitions?${query.toString()}`, "GET");
    if (!res.ok) { throw new Error(`Failed to fetch competitions: ${res.status} ${res.statusText}`);}

    return await res.json()
}

// ---------- FECTH SINGLE COMPETITION ----------
export async function fetchCompetitionById(id: string,): Promise<Competition> {
    const res = await apiCall(`/competitions/${id}`, "GET");

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to fetch competition (${res.status})`,);
    }

    return res.json();
}

// ---------- GET FEATURED COMPETITIONS ----------
export async function getFeaturedComps() {
    const res = await apiCall("/competitions/featured")

    if (!res.ok) {throw new Error("Failed to fetch featured competitions")}

    return await res.json();
}

// ---------- CREATE SUBMISSION ----------
export async function createSubmission(
    competitionId: string,
    imageId: string,
): Promise<Submission> {
    const res = await apiCall(`/competitions/${competitionId}/submissions`, "POST",
        {imageId},
    );

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to create submission (${res.status})`);
    }

    sessionStorage.clear();
    return res.json();
}

// ---------- VOTE ON SUBMISSION ----------
export async function voteOnSubmission(submissionId: string): Promise<void> {
    const res = await apiCall(`/submissions/${submissionId}/vote`, "POST");

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to vote (${res.status})`);
    }
}

// ---------- REMOVE SUBMISSIONVOTE ----------
export async function removeVote(submissionId: string): Promise<void> {
    const res = await apiCall(`/submissions/${submissionId}/vote`, "DELETE");

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `Failed to remove vote (${res.status})`);
    }
}

// ---------- DELETE SUBMISSION ----------
export async function deleteSubmission(submissionId: string) {
    const res = await apiCall(
        `/submissions/${submissionId}`,
        "DELETE"
    );
    const data = await res.json();

    if (!res.ok) { throw new Error(data.message); }

    return data;
}