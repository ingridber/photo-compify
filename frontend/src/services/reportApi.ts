import { apiCall } from "../utils/apiCall";
import type { UserRef } from "../types/competitions";

// ---------- CHECK PREVIOUS REPORT ----------
interface CheckReport {
    submissionId: string;
    email: string;
    token: string;
}

export async function checkNoPreviousReport(conditions: CheckReport){
    const res = await apiCall("/report/check", "POST",
        conditions
    );
    const data = await res.json();
    return data;
}

// ---------- CREATE  REPORT ----------
interface CreateReportData {
    reportedUserId: string | UserRef;
    submissionId: string;
    competitionId: string;
    name: string;
    email: string;
    description: string;
    evidenceImg?: string | null;
}

export async function createReport(reportData: CreateReportData) {
    const res = await apiCall("/report/create", "POST",
        reportData
    );
    const data = await res.json();
    if (!res.ok) { throw data; }
    return data;
}

// ---------- GET  REPORTS ----------
export async function getReports() {
    const res = await apiCall("/report");
    const data = await res.json();
    if (!res.ok) { throw data; }
    return data;
}



// ---------- WARN USER ----------
export async function warnUser(userId: string) {
    const res = await apiCall(
        `/report/${userId}`,
        "PATCH"
    );
    const data = await res.json();

    if (!res.ok) { throw new Error(data.message || "Failed to warn user"); }

    return data;
}

// ---------- RESOLVE REPORT ----------
interface ResolveReportData {
    auditedBy: string;
    reportedUserContact?: string;
    reportedUserWarnings?: number;
    responseContact: string;
    reportId: string;
    filename: string;
    uploaded: string;
    compTitle: string;
}

export async function hardAcceptReport(
    reportId: string,
    reportData: ResolveReportData
) {
    const res = await apiCall(
        `/report/accept/${reportId}`,
        "PATCH",
        reportData
    );
    const data = await res.json();

    if (!res.ok) { throw new Error(data.message || "Failed to resolve report"); }

    return data;
}


export async function declineReport(
    reportId: string,
    reportData: ResolveReportData
) {
    const res = await apiCall(`/report/decline/${reportId}`,
        "PATCH",
        reportData
    );
    
    const data = await res.json();

    if (!res.ok) { throw new Error(data.message || "Failed to resolve report"); }

    return data;
}

export async function clearEvidenceImgRef(
    reportId: string,
) {
    const res = await apiCall(`/report/clear/${reportId}`,
        "PATCH",
    );

    if (!res.ok) { throw new Error("Failed to clear report"); }

    return ;
}