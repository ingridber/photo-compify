import { useState, useEffect } from "react";
import { getReports } from "../services/reportApi"
import { Throbber } from "../components/user-feedback/Throbber";
import styles from "../styles/handle-reports.module.css";
import { useUser } from "../hooks/useUser";

interface Report {
    _id: string;
    reportId: string;
    email: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    resolved: boolean;
    name: string;
    competitionId: { title: string;}
    evidenceImg: {_id: string; url: string;} | null;
    submissionId: { _id: string;
        image: { filename: string; uploadedAt: string;}
    }
    submissionImage: { _id: string; url: string;} | null;
    reportedUserId: {_id: string; email: string; warnings: number; username: string;};
}

export default function HandleReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<number | null>(null);
    const {user} = useUser();
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await getReports();
                setReports(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    if (loading) {return <Throbber/>;}
    const toggleReport = (index: number) => {setOpen(open === index ? null : index);};

    // -----------------------------------
    // ---------- HANDLE ACCEPT ----------
    // -----------------------------------
    const handleAccept = async (report: Report) => {
        try {
            setStatusMessage("Deleting submission")
            // ---------- delete submission ----------
            const resDelete = await fetch(`http://localhost:3000/api/v1/submissions/${report.submissionId._id}`, {
                credentials: "include",
                method: "DELETE",
            });

            if (!resDelete.ok) {
                const data = await resDelete.json();
                throw new Error(data.message);
            }
            setStatusMessage("Submission deleted. Warning user...")

            // ---------- warn user ----------
            const resWarning = await fetch(`http://localhost:3000/api/v1/report/${report.reportedUserId._id}`, {
                credentials: "include",
                method: "PATCH",
            });

            if (!resWarning.ok) { throw new Error("Failed to warn user"); }
            setStatusMessage("User warned. Sending emails...");

            // ---------- resolve report, send emails ----------
            const resResolve = await fetch(`http://localhost:3000/api/v1/report/resolve/${report._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    auditedBy: user?._id,
                    reportedUserContact: report.reportedUserId.email,
                    reportedUserWarnings: report.reportedUserId.warnings,
                    responseContact: report.email,
                    reportId: report.reportId,
                    filename: report.submissionId.image.filename,
                    uploaded: report.submissionId.image.uploadedAt,
                    compTitle: report.competitionId.title,
                })
            })
            if (!resResolve.ok) { throw new Error("Failed to resolve report");}
            setStatusMessage("Report resolved successfully");

            // ---------- move resolved to resolved ----------
            setReports(prev =>
                prev.map(r => r._id === report._id ? { ...r, resolved: true } : r)
            );

        } catch (err) {
            setStatusMessage(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    const unresolvedReports = reports.filter(r => !r.resolved);
    const resolvedReports = reports.filter(r => r.resolved);

    return (
        <>
        <div className={styles.reportContainer}>
            <h1>Reports</h1>
            
            <h2 className={styles.unresolved}>Unresolved</h2>

            {unresolvedReports.length > 0 ? (
                unresolvedReports.map((report, index) => {
                    const isOpen = open === index;
                
                    return (
                        <div key={report._id} className={styles.reportItem}>
                            <button
                                className={styles.report}
                                onClick={() => toggleReport(index)}
                            >
                                <div className={styles.reportHeader}>
                                    <p className={styles.reportTitle}>{report.reportId}</p>
                                </div>
                                <img
                                    src="/icons/arrow.svg"
                                    alt="Toggle report"
                                    className={`${styles.showReportIcon} ${
                                        isOpen ? styles.open : ""
                                    }`}
                                />
                            </button>

                        {isOpen && (
                            <div className={styles.reportWrapper}>
                                <div className={styles.reportMain}>
                                    
                                    {/* ---------- REPORTED USER ---------- */}
                                    <div>
                                        <p className={styles.reportSpecsTitle}>User</p>
                                        <p>User: {report.reportedUserId.username}</p>
                                        <p>Warnings: {report.reportedUserId.warnings}</p>
                                    </div>

                                    {report.submissionImage && (
                                        <div className={styles.imageContainer}>
                                            <p className={styles.reportSpecsTitle}>Reported img</p>
                                            <img
                                                src={report.submissionImage.url}
                                                alt="Reported submission"
                                                className={styles.imageThumbnail}
                                                onClick={() => {if (report.submissionImage?.url) { setFullscreenImage(report.submissionImage.url);}}}
                                            />
                                        </div>
                                    )}

                                    {/* ---------- REPORTER ---------- */}
                                    <div className={styles.reporterSpecs}>
                                        <p className={styles.reportSpecsTitle}>Reporter</p>
                                        <p>Name: {report.name}</p>
                                        <p className={styles.description}>Description: {report.description}</p>
                                    </div>

                                    {report.evidenceImg && (
                                        <div className={styles.imageContainer}>
                                            <p className={styles.reportSpecsTitle}>Evidence img</p>
                                            <img
                                                src={report.evidenceImg.url}
                                                alt="Reported submission"
                                                className={styles.imageThumbnail}
                                                onClick={() => { if (report.evidenceImg?.url) {setFullscreenImage(report.evidenceImg.url);}}}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.reportActions}>
                                    <button onClick={() => handleAccept(report)}
                                        className={styles.acceptBtn}>
                                        Accept
                                    </button>
                                    <button className={styles.declineBtn}>Decline</button>
                                </div>

                                <p>created at: {report.createdAt}</p>
                                {statusMessage && (
                                    <p className={styles.statusMessage}>{statusMessage}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })
        ) : (
            <p>No reports</p>
        )}

        <h2> Resolved</h2>
        {resolvedReports.length > 0 ? (
            resolvedReports.map((report) => {
                return (
                    <div key={report._id} className={styles.reportItem}>
                            <div className={styles.reportHeader}>
                                <p>{report.reportId}</p>
                            </div>
                    </div>
                );
            })   
        ) : (
            <p>No reports</p>
        )}
    </div>

    {fullscreenImage && (
        <div
            className={styles.fullscreenModal}
            onClick={() => setFullscreenImage(null)}
        >
            <div
                className={styles.fullscreenContent}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={fullscreenImage}
                    className={styles.fullscreenImage}
                />
                <button
                    className={styles.closeFullscreenBtn}
                    onClick={() => setFullscreenImage(null)}
                >
                    Close
                </button>
            </div>
        </div>
    )}
    </>
);
}