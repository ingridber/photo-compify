import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import CompetitionsProfileCard from "../components/competitions/CompetitionsProfileCard";
import type { Submission, Competition } from "../types/competitions";
import type { PublicProfile } from "../types/user";
import { Throbber } from "../components/user-feedback/Throbber";
import profileStyle from "../components/profile/profile.module.css";
import fullscreenStyle from "../styles/fullscreen-image.module.css";
import modalStyles from "../styles/upload-overlay.module.css";
import { getSubmissionIndicator } from "../utils/submissionIndicators";
import { apiCall } from "../utils/apiCall";
import ReportForm from "../components/report/ReportForm";

export default function PublicProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState<"submissions" | "competitions" | "wins">("submissions");
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await apiCall(`/user/${username}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await res.json();
                setProfile(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error");
                }
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [username]);

    if (loading) return <Throbber />;
    if (error) return <p>{error}</p>;
    if (!profile) return <p>User not found</p>;

    const getIndicatorForSubmission = (submission: Submission) => getSubmissionIndicator(submission);

    return (
    <>
    {/* HEADER ----- Profile pic, username, preferred themes & camera, stats */}
    <header className={profileStyle.hero}>
        {/* ----- Profile pic ----- */}
        <div className={profileStyle.heroInner}>
            <div
                className={profileStyle.avatarRing}
                onClick={() => setView("submissions")}
            >
                <div className={profileStyle.avatar}>
                    <DisplayProfilePicture src={profile.user.profilePicture?.url}/>
                </div>
            </div>

            <div className={profileStyle.heroMeta}>
                {/* ----- username ----- */}
                <p className={profileStyle.heroEyebrow}>Photographer</p>
                <h1 className={profileStyle.heroName} onClick={() => setView("submissions")}>{profile.user.username}</h1>

                {/* ----- themes & camera ----- */}
                <div className={profileStyle.themePills}>
                    {profile.user.themes && profile.user.themes.length > 0 ? (
                        profile.user.themes.map((theme) => {
                            const safeTheme = theme ?? "Default";
                            const themeClass = `${safeTheme.replace(/\s+/g, "").replace(/&/g, "")}Color`;

                            return (
                                <span key={safeTheme} className={`${profileStyle.pill} ${themeClass}`}>
                                    {safeTheme}
                                </span>
                            );
                        })
                    ) : (
                        <span className={profileStyle.heroMuted}>No themes specified</span>
                    )}
                </div>
                <p className={profileStyle.cameraLine}>
                    <img src="/icons/camera-detail.svg" alt="camera" className={profileStyle.cameraIcon}/>
                    {profile.user.camera ? profile.user.camera : "Camera not specified"}
                </p>
            </div>
        </div>

        {/* ----- stats ----- */}
        <div className={profileStyle.statsRow}>
            {/* ----- hosted ----- */}
            <div className={`${profileStyle.statCell} ${profileStyle.statClickable}`} onClick={() => setView("competitions")}>
                <span className={profileStyle.statValue}>{profile.stats.competitionsCreated}</span>
                <span className={profileStyle.statLabel}>Hosted comps</span>
            </div>
            {/* ----- submitted ----- */}

            <div className={`${profileStyle.statCell} ${profileStyle.statClickable}`} onClick={() => setView("submissions")}>
                <span className={profileStyle.statValue}>{profile.stats.submissions}</span>
                <span className={profileStyle.statLabel}>Submitted</span>
            </div>
            {/* ----- wins ----- */}
            <div className={`${profileStyle.statCell} ${profileStyle.statClickable}`} onClick={() => setView("wins")}>
                <span className={profileStyle.statValue}>{profile.stats.wins}</span>
                <span className={profileStyle.statLabel}>Wins</span>
            </div>
        </div>
    </header>

    {/* ----- VIEWS ----- */}
    {/* submissions & wins */}
    {view === "submissions" || view === "wins" ? (
        <>
        <section className={profileStyle.submissionsGrid}>

            {profile.submissions.filter((submission) =>
                view === "wins"
                    ? getSubmissionIndicator(submission) === "gold"
                    : true
            ).length > 0 ? (
                profile.submissions
                    .reverse()
                    .filter((submission) =>
                        view === "wins"
                        ? getSubmissionIndicator(submission) === "gold"
                        : true
                    )
                    .map((submission: Submission, i: number) => {
                        const indicator =
                        getIndicatorForSubmission(submission);

                        return (
                        <div key={submission._id} className={profileStyle.submissionCell} style={{animationDelay: `${i * 60}ms`,}}>
                            {/* ----- submission pic ----- */}
                            <img
                                className={profileStyle.submissionImg}
                                src={submission.imageUrl}
                                onClick={() => {
                                    if (submission.imageUrl) {
                                        setFullscreenImage(submission.imageUrl)
                                        setSelectedSubmission(submission)
                                    }
                                }}
                            />

                            {/* ----- comp title & placement----- */}
                            <div className={profileStyle.submissionFooter}>
                                <p className={profileStyle.competitionTitle}
                                    onClick={() => navigate(`/competitions/${typeof submission.competition === "string"
                                        ? submission.competition
                                        : submission.competition._id}`)}
                                >
                                    {submission.competitionTitle}
                                </p>
                                { view === 'submissions' &&
                                    <div className={profileStyle.placementContainer}>
                                        <img src="/icons/medal.svg" alt="medal" className={profileStyle.medalIcon}/>
                                        <span>
                                            {indicator === "gold"
                                                ? "1"
                                                : indicator === "silver"
                                                    ? "2"
                                                    : indicator === "bronze"
                                                        ? "3"
                                                        : ""}
                                        </span>
                                    </div>
                                }
                            </div>
                        </div>
                    );
            })
            ) : (
                <p className={profileStyle.emptyText}>{view === "wins" ? "No wins yet" : "No visible submissions yet"}</p>
            )}
        </section>

        {/* ----- SUBMISSION FULLSCREEN VIEW MODAL OVERLAY ----- */}
        {fullscreenImage && (
            <div className={fullscreenStyle.fullscreenModal} onClick={() => setFullscreenImage(null)} >
                <div className={fullscreenStyle.fullscreenContent} onClick={(e) => e.stopPropagation()} >
                    <img src={fullscreenImage} className={fullscreenStyle.fullscreenImage} onClick={()=> setFullscreenImage(null)}/>

                    <div className={fullscreenStyle.fullscreenActions}>
                        <button className={`${fullscreenStyle.closeFullscreenBtn} ${fullscreenStyle.reportBtn}`} onClick={() => {setShowReportModal(true)}}>
                            <img src="/icons/report.svg" alt="report picture" className={fullscreenStyle.reportBtnIcon} />
                        </button>
                        <button className={fullscreenStyle.closeFullscreenBtn} onClick={() => setFullscreenImage(null)}>
                            <img src="/icons/close.svg" alt="close fullscreen view" className={fullscreenStyle.closeFullscreenBtnIcon} />
                        </button>
                    </div>

                </div>
            </div>
        )}

        {/* REPORT  */}
        {showReportModal && selectedSubmission && (
            <div className={modalStyles.modalOverlay}>
                <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <button className={modalStyles.closeBtn}onClick={() => setShowReportModal(false)}>
                        ✕
                    </button>
                    <ReportForm
                        submissionId={selectedSubmission._id}
                        competitionId={typeof selectedSubmission?.competition === "string"
                            ? selectedSubmission.competition
                            : selectedSubmission?.competition?._id}
                        reportedUserId={selectedSubmission.user}
                    />
                </div>
            </div>
        )}
        </>
    ) : (
    // ----- VIEW -----
    // competitions
        <section className={profileStyle.competitionsGrid}>
            {profile.competitions.length > 0 ? (
                [...profile.competitions]
                    .sort((a, b) => {
                        const phaseOrder = {
                            voting: 0,
                            submission: 1,
                            ended: 2,
                        };

                        const phaseA = a.phase;
                        const phaseB = b.phase;

                        return phaseOrder[phaseA] - phaseOrder[phaseB];
                    })
                .map((competition: Competition) => (
                    <CompetitionsProfileCard key={competition._id} competition={competition}/>
                ))
            ) : (
                <p className={profileStyle.emptyText}>No competitions created yet</p>
            )}
        </section>
    )}
    </>
    );
}