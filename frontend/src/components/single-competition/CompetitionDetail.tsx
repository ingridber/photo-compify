import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchCompetitionById } from "../../services/competitions.ts";
import { type Competition, type Submission } from "../../types/competitions.ts";
import styles from "./CompetitionDetail.module.css";
import modalStyles from "../../styles/upload-overlay.module.css";
import fullscreenStyle from "../../styles/fullscreen-image.module.css";
import { useUser } from "../../hooks/useUser.ts";
import { Throbber } from "../user-feedback/Throbber.tsx";
import VoteButton from "./VoteButton.tsx";
import ImageUploadForm from "../images/ImageUploadForm.tsx";
import { getIndicator, sortSubmissions } from "../../utils/submissionIndicators.ts";
import ReportForm from "../report/ReportForm.tsx";
import { deleteSubmission } from "../../services/competitions.ts";

function formatCountdown(target: string): string {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return "0m";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days >= 2) return `${days}d`;
    if (days >= 1) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
}

export default function CompetitionDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [_selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showLogoModal, setShowLogoModal] = useState(false);
    const [fullscreenSubmission, setFullscreenSubmission] = useState<Submission | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const loadCompetition = useCallback(() => {
        if (!id) return;

        setLoading(true);
        fetchCompetitionById(id)
            .then(setCompetition)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        loadCompetition();
    }, [loadCompetition]);

    useEffect(() => {
    if (!deleteError) return;

    const timer = setTimeout(() => {
            setDeleteError(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [deleteError]);

    if (loading) return <Throbber />;
    if (error) return <p>{error}</p>;
    if (!competition) return <p>Competition not found</p>;
    const phase = competition.phase;

    const sorted = sortSubmissions(competition.submissions, phase, user?._id);
    const userSubmission = competition.submissions.find((s) => {
        if (!s.user) return;
        const userId = typeof s.user === "string" ? s.user : s.user._id;
        return userId === user?._id;
    });

    const countdownTarget =
        phase === "submission"
            ? competition.votingStartDate
            : competition.endDate;

    function handleVoteChange(submissionId: string, voted: boolean) {
        if (!user) return;

        setCompetition(prev => {
            if(!prev) return prev;

            return {
                ...prev,
                submissions: prev.submissions.map(sub =>
                    sub._id === submissionId
                    ? {
                        ...sub,
                        votes: voted
                        ? [...sub.votes, user._id]
                        : sub.votes.filter(id => id !== user._id)}
                    : sub)
            }
        })
        setFullscreenSubmission(prev => {
            if (!prev || prev._id !== submissionId) return prev;

            return {
                ...prev,
                votes: voted
                    ? [...prev.votes, user._id]
                    : prev.votes.filter(id => id !== user._id)
            };
        });
    }

    function handleLogoUploadSuccess() {
        setShowLogoModal(false);
        loadCompetition();
    }

    async function handleDelete(id: string) {
        try {
            await deleteSubmission(id);
            loadCompetition();
            sessionStorage.clear();
        } catch (err) {
            if (err instanceof Error) {
                setDeleteError(err.message);
            } else {
                setDeleteError("Something went wrong");
            }
        }
    }

    return (
    <div className={styles.container}>
        {/* ----- HEADER: logo, comp-title, themes ----- */}
        <header className={styles.header}>
            <div className={styles.hero}>
                {/* ----- logo ----- */}
                <div className={styles.logo}>
                    {competition.signedLogoUrl ? (
                    <>
                        <div className={styles.logoContainer}>
                            <img className={styles.logoPic} src={competition.signedLogoUrl} alt={`${competition.title} logo`}/>
                        </div>

                        {competition.owner && 
                        user?.username === competition.owner.username && 
                        phase !== "ended" && (
                            <button className={styles.uploadLogoBtn} onClick={() => setShowLogoModal(true)}>
                                {competition.signedLogoUrl ? 'Change Logo' : 'Update Logo'}
                            </button>
                        )}
                    </>
                    ) : (
                    <>
                        {competition.owner &&
                        user?.username === competition.owner.username &&
                        phase !== "ended" && (
                            <>
                            <div className={styles.logoContainer}>              
                                <img className={styles.noLogo} src="/icons/competitions.svg" alt="Competition icon"/>
                            </div>
                            <button className={styles.uploadLogoBtn} onClick={() => setShowLogoModal(true)}>Update Logo</button>
                            </>
                        )}
                    </>
                    )}
                </div>
                <div className={styles.heroMeta}>
                    {/* ----- comp title & owner ----- */}
                    <p className={styles.heroEyebrow}>Competition</p>
                    <h1 className={styles.title}>{competition.title}</h1>
                    <p className={styles.owner} onClick={() => navigate(`/users/${competition.owner.username}`)}>
                        By: {competition.owner?.username ?? "Deleted User"}
                    </p>

                    {/* ----- themes ----- */}
                    <div className={styles.themePills}>
                        {(competition.themes ?? []).map((theme) => {
                            const safeTheme = theme ?? "Default";
                            const themeClass = `${safeTheme
                                .replace(/\s+/g, "")
                                .replace(/&/g, "")}Color`;

                            return (
                                <span className={`${styles.pill} ${themeClass}`} key={safeTheme}>{safeTheme}</span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </header>

        {/* DESCRIPTION */}
        <div className={styles.descriptionContainer}>
            <p className={styles.descriptionTitle}>Description</p>
            <p className={styles.description}>{competition.description}</p>
        </div>

        {/* ----- STATS: comp phase, time indicators & winner, participants ----- */}
        <div className={styles.stats}>
            {/* ----- comp phase ----- */}
            <div className={styles.statCell}>
                <span className={styles.statLabel}>Phase</span>
                <span className={styles.statValue}>{phase === "submission" ? "open" : phase === "ended" ? "closed" : phase}</span>
            </div>
            {/* ----- STATS ----- */}
            <div className={styles.statCell}>
                {phase === "submission" && (<>
                        <span className={styles.statLabel}>Voting begins</span>
                        <span className={styles.statValue}>{formatCountdown(countdownTarget)}</span>
                </>)}
                {phase === "voting" && (<>
                        <span className={styles.statLabel}>Ends in</span>
                        <span className={styles.statValue}>{formatCountdown(countdownTarget)}</span>
                </>)}
                {phase === "ended" && sorted.length > 0 && (<>
                        <span className={styles.statLabel}>Winner</span>
                        <span className={styles.statValue}onClick={() => navigate(`/users/${sorted[0].user.username}`)} style= {{cursor: "pointer"}}>
                            {sorted[0].user.username}
                        </span>
                </>)}
            </div>
            {/* ----- participants ----- */}
            <div className={styles.statCell}>
                <span className={styles.statLabel}>Participants</span>
                <span className={styles.statValue}>{competition.submissions.length}</span>
            </div>
        </div>

        {/* VIEWS ----- submit & submissions */}

        {/* ----- submit ----- */}
        {phase === "submission" && !userSubmission && (
            <div className={styles.cta}>
                <p className={styles.ctaTitle}>Want to participate?</p>
                <button className={styles.editSubmit} type="button" onClick={() => navigate(`/competitions/${id}/submit`)}>
                    SUBMIT
                </button>
                <p className={styles.ctaSubtext}>Submit your entry before voting begins</p>
            </div>
        )}

        {phase === "submission" && userSubmission && (
            <div className={styles.submittedLayout}>
                <img className={styles.ctaImage} src={userSubmission.signedImageUrl} alt="Your submission"/>
                <div className={styles.submittedInfo}>
                    <p className={styles.ctaTitle}>You have submitted!</p>

                    <div className={styles.btnContainer}>
                        <button className={styles.editSubmit} type="button" onClick={() => {
                            navigate(`/competitions/${id}/submit/${userSubmission._id}`)
                        }}>
                            Edit your submission?
                        </button>
                        <button className={styles.editSubmit} onClick={() => handleDelete(userSubmission._id)}>
                            Delete submission
                        </button>
                    </div>
                    {deleteError && (
                        <p>{deleteError}</p>
                    )}
                </div>
            </div>
        )}
        {/* ----- submissions ----- */}
        {(phase === "voting" || phase === "ended") && (
            <section className={styles.submissionsGrid}>
                    <>
                        {sorted.map((sub, i) => (
                            <div key={sub._id ?? i} className={styles.submissionCell} style={{animationDelay: `${i * 60}ms`}}>
                                <img
                                    className={styles.submissionImg}
                                    src={sub.signedImageUrl}
                                    alt=""
                                    onClick={() => setFullscreenSubmission(sub)}
                                />
                                <div className={styles.submissionFooter}>

                                    {phase === 'ended' && (<>
                                        <p className={styles.submissionContributor}
                                            onClick={() => {
                                                setSelectedSubmission(sub);
                                                navigate(`/users/${sub.user?.username}`);
                                            }}
                                        >{sub.user?.username ?? "Unknown"}</p>

                                        <div className={styles.placementContainer}>
                                            <img src="/icons/medal.svg" alt="medal" className={styles.medalIcon}/>
                                            <span>
                                                {getIndicator(sub, phase, i, user?._id) === "gold" ? "1"
                                                : getIndicator(sub, phase, i, user?._id) === "silver" ? "2"
                                                : "3"}
                                            </span>
                                        </div>
                                    </>)}

                                    {phase === 'voting' && (<>
                                        <VoteButton
                                            submission={sub}
                                            phase={phase}
                                            userId={user?._id}
                                            onClose={() => setSelectedSubmission(null)}
                                            onVoteChange={handleVoteChange}/>
                                    </>)}
                                </div>
                            </div>
                        ))}
                    </>
            </section>
        )}

        {showLogoModal && (
            <div className={modalStyles.modalOverlay} onClick={() => setShowLogoModal(false)}>
                <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <button className={modalStyles.closeBtn} onClick={() => setShowLogoModal(false)}>✕</button>
                    <ImageUploadForm
                        pictureType="logo"
                        competitionId={id}
                        onUploadSuccess={handleLogoUploadSuccess}
                    />
                </div>
            </div>
        )}

        {fullscreenSubmission && (
            <div className={fullscreenStyle.fullscreenModal} onClick={() => setFullscreenSubmission(null)}>
                <div className={fullscreenStyle.fullscreenContent} onClick={(e) => e.stopPropagation()}>
                    <img
                        src={fullscreenSubmission.signedImageUrl}
                        className={fullscreenStyle.fullscreenImage}
                        alt="Submission"
                        onClick={() => setFullscreenSubmission(null)}
                    />
                    <div className={fullscreenStyle.fullscreenActions}>
                        <button className={`${fullscreenStyle.closeFullscreenBtn} ${fullscreenStyle.reportBtn}`} onClick={() => {setShowReportModal(true)}}>
                            <img src="/icons/report.svg" alt="report picture" className={fullscreenStyle.reportBtnIcon} />
                        </button>

                        {phase === 'voting' && (
                        <VoteButton
                            submission={fullscreenSubmission}
                            phase={phase}
                            userId={user?._id}
                            onClose={() => setSelectedSubmission(null)}
                            onVoteChange={handleVoteChange}
                            variant="fullscreen"/>
                        )}

                        <button className={fullscreenStyle.closeFullscreenBtn} onClick={() => setFullscreenSubmission(null)} >
                            <img src="/icons/close.svg" alt="close fullscreen view" className={fullscreenStyle.closeFullscreenBtnIcon} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* REPORT  */}
        {showReportModal && fullscreenSubmission && (
            <div className={modalStyles.modalOverlay}>
                <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <button className={modalStyles.closeBtn}onClick={() => setShowReportModal(false)}>
                        ✕
                    </button>
                    <ReportForm
                        submissionId={fullscreenSubmission._id}
                        competitionId={competition._id}
                        reportedUserId={fullscreenSubmission.user?._id}
                    />
                </div>
            </div>
        )}
    </div>
    );
}
