import { useState, useEffect } from "react";
import { getUserSubmits } from "../../services/user";
import { useNavigate } from "react-router";
import type { Submission } from "../../types/competitions";
import profileStyle from "./profile.module.css";
import fullscreenStyle from "../../styles/fullscreen-image.module.css";
import { getSubmissionIndicator } from "../../utils/submissionIndicators";

type Props = {
    showOnlyWins?: boolean;
};

export default function ProfileSubmissions({showOnlyWins = false}: Props) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadSubmissions() {
            // tillfälligt löst med sessionStorage.clear i uplaodsubmission, deletesubmission
            try {
                const cached = sessionStorage.getItem("profile-submissions");

                if (cached) {
                    const parsed = JSON.parse(cached);
                    const now = Date.now();
                    const oneHour = 1000 * 60 * 60;

                    if (now - parsed.timestamp < oneHour) {
                        setSubmissions(parsed.data);
                        return;
                    }
                }

                const result = await getUserSubmits();
                setSubmissions(result.submissions);

                sessionStorage.setItem(
                    "profile-submissions",
                    JSON.stringify({
                        data: result.submissions,
                        timestamp: Date.now(),})
                );
            } catch (err) {
                throw err;
            }
        }
        loadSubmissions();
    }, []);

    // ---------- FILTER WINS ----------
    const filteredSubmissions = showOnlyWins
        ? submissions.filter((submission) => getSubmissionIndicator(submission) === "gold")
        : submissions;

    return (
    <>
        <div className={profileStyle.submissionsGrid}>
            {filteredSubmissions.length > 0 ? (
                [...filteredSubmissions]
                .reverse()
                .map((submission, i) => {

                    const indicator = getSubmissionIndicator(submission);

                    return (
                        <div
                            key={submission._id}
                            className={profileStyle.submissionCell}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <img
                                src={submission.imageUrl}
                                onClick={() => {
                                    if (submission.imageUrl) {
                                        setFullscreenImage(submission.imageUrl);
                                    }
                                }}
                                className={profileStyle.submissionImg}
                            />

                            {/* CARD FOOTER ----- Comp Title, Phase indicator ----- */}
                            <div className={profileStyle.submissionFooter}>
                                <p
                                    className={profileStyle.competitionTitle}
                                    onClick={() =>
                                        navigate(`/competitions/${typeof submission.competition === "string"
                                            ? submission.competition
                                            : submission.competition._id}`
                                        )}
                                >
                                    {submission.competitionTitle}
                                </p>

                                {typeof submission.competition !== "string" && (() => {
                                    const phase = submission.competition.phase;

                                    return (
                                        !showOnlyWins && (
                                            <div className={profileStyle.placementContainer}
                                                onClick={
                                                    phase !== "ended"
                                                        ? () =>
                                                            navigate(
                                                                `/competitions/${
                                                                    typeof submission.competition === "string"
                                                                        ? submission.competition
                                                                        : submission.competition._id
                                                                }`
                                                            )
                                                        : undefined
                                                }
                                                style={{cursor: phase !== "ended" ? 'pointer' : 'default'}}>
                                                {/* ÄNDRA FÄRG PÅ MEDALJ EFTER PLACERING?  */}
                                                <img
                                                    src={ 
                                                        phase === "ended" ? "/icons/medal.svg"
                                                        : phase === "submission" ? "/icons/edit.svg"
                                                        : "/icons/hourglass.svg"}
                                                    className={profileStyle.placementIcon}
                                                />
                                                <span>
                                                    {phase === "ended" ? 
                                                        indicator === "gold" ? "1"
                                                        : indicator === "silver" ? "2"
                                                        : "3"
                                                    : phase === "submission" ? "edit" : "vote"}
                                                </span>
                                            </div>
                                        )
                                    );
                                })()}

                            </div>
                        </div>);
            })
            ) : (
                <p className={profileStyle.emptyText}>{showOnlyWins ? "No wins yet" : "No submissions yet"}</p>
            )}
        </div>

        {fullscreenImage && (
            <div
                className={fullscreenStyle.fullscreenModal}
                onClick={() => setFullscreenImage(null)}
            >
                <div
                    className={fullscreenStyle.fullscreenContent}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={fullscreenImage}
                        className={fullscreenStyle.fullscreenImage}
                    />
                    <div className={fullscreenStyle.fullscreenActions}>
                        <button
                            style={{margin: "auto"}}
                            className={fullscreenStyle.closeFullscreenBtn}
                            onClick={() => setFullscreenImage(null)}
                        >
                            <img src="/icons/close.svg" alt="close fullscreen view" className={fullscreenStyle.closeFullscreenBtnIcon} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
}
