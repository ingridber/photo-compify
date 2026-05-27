import { useState, useEffect } from "react";
import { getUserSubmits } from "../../services/api";
import { useNavigate } from "react-router";
import SubmissionCard from "../single-competition/SubmissionCard";
import type { Submission } from "../../types/competitions";
import profileStyle from "./profile.module.css";

export default function ProfileSubmissions() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadSubmissions() {
            try {
                // ---------- CHECK CACHE ----------
                const cached = sessionStorage.getItem("profile-submissions");

                if (cached) {
                    const parsed = JSON.parse(cached);
                    const now = Date.now();
                    const oneHour = 1000 * 60 * 60;

                    // ---------- CACHE STILL VALID ----------
                    if (now - parsed.timestamp < oneHour) {
                        setSubmissions(parsed.data);
                        return;
                    }
                }

                // ---------- FETCH NEW ----------
                const result = await getUserSubmits();
                setSubmissions(result.submissions);

                // ---------- SAVE CACHE ----------
                sessionStorage.setItem(
                    "profile-submissions",
                    JSON.stringify({ data: result.submissions, timestamp: Date.now() })
                );
            } catch (err) {
                console.log(err);
            }
        }
        loadSubmissions();
    }, []);

    return (
        <div className={profileStyle.submissionsGrid}>
            {submissions.length > 0 ? (
                submissions.map((submission, i) => (
                    <div
                        key={submission._id}
                        className={profileStyle.submissionCell}
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <SubmissionCard
                            submission={{
                                ...submission,
                                signedImageUrl: submission.imageUrl,
                            }}
                            indicator={submission.indicator ?? "none"}
                            onClick={() =>
                                navigate(
                                    `/competitions/${
                                        typeof submission.competition === "string"
                                            ? submission.competition
                                            : submission.competition._id
                                    }`
                                )
                            }
                        />
                    </div>
                ))
            ) : (
                <p className={profileStyle.emptyText}>No submissions yet</p>
            )}
        </div>
    );
}
