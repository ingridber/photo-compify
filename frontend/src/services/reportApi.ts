import { apiCall } from "../utils/apiCall";

// ---------- CHECK PREVIOUS REPORT ----------
interface CheckReport {
    submissionId: string;
    email: string;
}

export async function checkNoPreviousReport(conditions: CheckReport){
    const res = await apiCall("/report/check", "POST",
        { conditions }
    );
    const data = await res.json();
    return data;
}

// ---------- CREATE  REPORT ----------
interface CreateReportData {
    reportedUserId: string;
    submissionId: string;
    competitionId: string;
    name: string;
    email: string;
    description: string;
    evidenceImg?: string | null;
}

export async function createReport(reportData: CreateReportData) {
    const res = await apiCall("/report", "POST",
        { reportData }
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
