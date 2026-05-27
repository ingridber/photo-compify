import { useUser } from "../hooks/useUser";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { useEffect, useState } from "react";
import { getUserStats } from "../services/api";
import { Outlet, useNavigate } from "react-router";
import ProfileEditDetails from "../components/profile/ProfileEditDetails";
import profileStyle from "../components/profile/profile.module.css";

export function ProfilePage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [stats, setStats] = useState({
        wins: 0,
        submissions: 0,
        competitionsCreated: 0
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const result = await getUserStats();
                setStats(result);
            } catch (err) {
                console.log(err);
            }
        }
        loadStats();
    }, []);

    return (
        <>
            {/* HERO HEADER */}
            <header className={profileStyle.hero}>
                <div className={profileStyle.heroInner}>
                    <div
                        className={profileStyle.avatarRing}
                        onClick={() => navigate("/profile")}
                    >
                        <div className={profileStyle.avatar}>
                            <DisplayProfilePicture src={user?.profilePicture?.url}/>
                        </div>
                    </div>

                    <div className={profileStyle.heroMeta}>
                        <p className={profileStyle.heroEyebrow}>Photographer</p>
                        <h1
                            className={profileStyle.heroName}
                            onClick={() => navigate("/profile")}
                        >
                            {user ? user.username : "User"}
                        </h1>

                        {/* THEMES */}
                        {!showEdit && (
                            <div className={profileStyle.themePills}>
                                {user?.themes && user.themes.length > 0 ? (
                                    user.themes.map((theme) => {
                                        const safeTheme = theme ?? "Default";
                                        const themeClass = `${safeTheme
                                            .replace(/\s+/g, "")
                                            .replace(/&/g, "")}Color`;
                                        return (
                                            <span
                                                className={`${profileStyle.pill} ${profileStyle[themeClass]}`}
                                                key={safeTheme}
                                            >
                                                {safeTheme}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className={profileStyle.heroMuted}>No themes specified</span>
                                )}
                            </div>
                        )}

                        {/* CAMERA */}
                        {!showEdit && (
                            <p className={profileStyle.cameraLine}>
                                <img src="/camera-detail.svg" alt="camera" className={profileStyle.cameraIcon} />
                                {user?.camera ? user.camera : "Camera not specified"}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => setShowEdit(!showEdit)}
                        className={profileStyle.editBtn}
                        aria-label={showEdit ? "Close edit" : "Edit profile"}
                    >
                        {showEdit ? "✕" : "Edit"}
                    </button>
                </div>

                {/* STATS BAR */}
                <div className={profileStyle.statsRow}>
                    <div
                        className={`${profileStyle.statCell} ${profileStyle.statClickable}`}
                        onClick={() => navigate("/profile/competitions")}
                    >
                        <span className={profileStyle.statValue}>{stats.competitionsCreated}</span>
                        <span className={profileStyle.statLabel}>Hosted</span>
                    </div>
                    <div
                        className={`${profileStyle.statCell} ${profileStyle.statClickable}`}
                        onClick={() => navigate("/profile")}
                    >
                        <span className={profileStyle.statValue}>{stats.submissions}</span>
                        <span className={profileStyle.statLabel}>Submitted</span>
                    </div>
                    <div className={profileStyle.statCell}>
                        <span className={profileStyle.statValue}>{stats.wins}</span>
                        <span className={profileStyle.statLabel}>Wins</span>
                    </div>
                </div>
            </header>

            {/* EDIT PANEL */}
            {showEdit && (
                <section className={profileStyle.editPanel}>
                    <ProfileEditDetails handleSave={() => setShowEdit(false)} />
                </section>
            )}

            {/* CHILD ROUTES */}
            <Outlet />
        </>
    );
}
