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
    const res = await fetch("http://localhost:3000/api/v1/report",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reportData),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw data;
    }

    return data;
}