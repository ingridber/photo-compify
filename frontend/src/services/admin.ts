import type { Competition } from "../types/competitions";
import { apiCall } from "../utils/apiCall";


// ---------- fetchUser for admin/Users ----------
export async function fetchUsers(pageNumber: number, search: string, role?: string) {
    const response = await apiCall( `/admin/users?page=${pageNumber}&limit=10&search=${search}${
    role ? `&role=${role}` : ""
  }`);

    if(!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
}

// ---------- update role for admin/Users----------
export async function updateRole(id: string, role: string) {
    const response = await apiCall(`/admin/users/${id}/role`,
        "PATCH",
        { role }
    );

    if (!response.ok) {
        throw new Error("Failed to update user role");
    }

    return response.json();
}

// ---------- delete user for admin/Users----------
export async function deleteUser(userId: string) {
    const response = await apiCall(`/admin/users/${userId}`,
        "DELETE"
    );

    if(!response.ok) {
        throw new Error("Failed to delete user");
    }

    return response;
}

// ---------- fetch competitions for admin/Competitions----------
export async function fetchCompetitionsForAdminPage(pageNumber: number, searchValue: string, phaseValue: string) {
    const response = await apiCall(`/admin/competitions?page=${pageNumber}&limit=10&search=${searchValue}&phase=${phaseValue}`);

    if(!response.ok) {
        throw new Error("Failed to fetch competitions");
    }

    return response.json();
}

// ---------- update competition phase for admin/Competitions----------
export async function updateCompetitionsPhaseForAdminPage(id: string, data: Partial<Competition>) {
    const response = await apiCall(`/admin/competitions/${id}/phase`,"PATCH",data);

    if(!response.ok) {
        throw new Error("Failed to update competition");
    }

    return response.json();
}

// ---------- update competition phase for admin/Competitions----------
export async function updateCompetitionsTitleForAdminPage(id: string, data: Partial<Competition>) {
    const response = await apiCall(`/admin/competitions/${id}`,"PATCH",data);

    if(!response.ok) {
        throw new Error("Failed to update competition");
    }

    return response.json();
}

// ---------- delete competitions for admin/Competitions----------
export async function deleteCompetitionsForAdminPage(id: string) {
    const response = await apiCall(`/admin/competitions/${id}`,"DELETE");

    if(!response.ok) {
        throw new Error("Failed to delete competition");
    }

    return response;
}