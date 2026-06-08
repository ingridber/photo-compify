import { apiCall } from "../utils/apiCall";

export interface CreateReportData {
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

    if (!res.ok) {
        throw data;
    }

    return data;
}
