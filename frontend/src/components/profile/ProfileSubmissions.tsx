import { useState, useEffect } from "react";
import { getUserSubmits } from "../../services/api";
import { useNavigate } from "react-router";
import type { Submission } from "../../types/competitions";
import profileStyle from "./profile.module.css";

type Props = {
    showOnlyWins?: boolean;
};

export default function ProfileSubmissions({showOnlyWins = false}: Props) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadSubmissions() {
            // DET HÄR GÖR ATT NYA SUBMISSIONS INTE DYKER UPP I FLÖDET I PROFILEN DIREKT, SKA FUNDERA PÅ LÖSNING 
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
                console.log(err);
            }
        }
        loadSubmissions();
    }, []);

    // ---------- FILTER WINS ----------
    const filteredSubmissions = showOnlyWins
        ? submissions.filter((submission) => 
            submission.indicator === "gold" &&
            typeof submission.competition !== "string" &&
            submission.competition.phase === "ended")
        : submissions;

    return (
    <>
        <div className={profileStyle.submissionsGrid}>
            {filteredSubmissions.length > 0 ? (
                [...filteredSubmissions]
                .reverse()
                .map((submission, i) => (
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
                                <div className={profileStyle.placementContainer}>

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
                                            submission.indicator === "gold" ? "1"
                                            : submission.indicator === "silver" ? "2"
                                            : "3"
                                        : phase === "submission" ? "edit" : "vote"}
                                    </span>
                                </div>
                            )
                        );
                    })()}

                </div>
            </div>))
            ) : (
                <p className={profileStyle.emptyText}>{showOnlyWins ? "No wins yet" : "No submissions yet"}</p>
            )}
        </div>

        {fullscreenImage && (
            <div
                className={profileStyle.fullscreenModal}
                onClick={() => setFullscreenImage(null)}
            >
                <div
                    className={profileStyle.fullscreenContent}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={fullscreenImage}
                        className={profileStyle.fullscreenImage}
                    />
                    <button
                        className={profileStyle.closeFullscreenBtn}
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
