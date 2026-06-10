import { useUser } from "../hooks/useUser";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { useEffect, useState } from "react";
import { getUserStats } from "../services/user";
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
        {/* HEADER ----- Profile pic, username, preferred themes & camera, stats */}
        <header className={profileStyle.hero}>
            {/* ----- Profile pic ----- */}
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
                    {/* ----- username ----- */}
                    <p className={profileStyle.heroEyebrow}>Photographer</p>
                    <h1 className={profileStyle.heroName} onClick={() => navigate("/profile")}>{user ? user.username : "User"}</h1>

                    {/* ----- themes & camera ----- */}
                    <div className={profileStyle.themePills}>
                        {user?.themes && user.themes.length > 0 ? (
                            user.themes.map((theme) => {
                                const safeTheme = theme ?? "Default";
                                const themeClass = `${safeTheme.replace(/\s+/g, "").replace(/&/g, "")}Color`;

                                return (
                                    <span className={`${profileStyle.pill} ${themeClass}`} key={safeTheme}>
                                        {safeTheme}
                                    </span>
                                );
                            })
                        ) : (
                            <span className={profileStyle.heroMuted}>No themes specified</span>
                        )}
                    </div>
                    <p className={profileStyle.cameraLine}>
                        <img src="/icons/camera-detail.svg" alt="camera" className={profileStyle.cameraIcon} />
                        {user?.camera ? user.camera : "Camera not specified"}
                    </p>
                </div>

                <button
                    onClick={() => setShowEdit(!showEdit)}
                    className={profileStyle.editBtn}
                    aria-label={showEdit ? "Close edit" : "Edit profile"}
                >
                    {showEdit ? "Exit" : "Edit"}
                </button>
            </div>

            {/* EDIT PANEL ----- <ProfileEditDetails/> */}
            {showEdit && (
                <section className={profileStyle.editPanel}>
                    <ProfileEditDetails handleSave={() => setShowEdit(false)} />
                </section>
            )}

            {/* ----- stats ----- */}
            <div className={profileStyle.statsRow}>
                {/* ----- hosted ----- */}
                <div className={`${profileStyle.statCell} ${profileStyle.statClickable}`} onClick={() => navigate("/profile/competitions")}>
                    <span className={profileStyle.statValue}>{stats.competitionsCreated}</span>
                    <span className={profileStyle.statLabel}>Hosted comps</span>
                </div>
                {/* ----- submitted ----- */}
                <div className={`${profileStyle.statCell} ${profileStyle.statClickable}`} onClick={() => navigate("/profile")}>
                    <span className={profileStyle.statValue}>{stats.submissions}</span>
                    <span className={profileStyle.statLabel}>Submitted</span>
                </div>
                {/* ----- wins ----- */}
                <div className={`${profileStyle.statCell} ${profileStyle.statClickable}`} onClick={() => navigate("/profile/wins")}>
                    <span className={profileStyle.statValue}>{stats.wins}</span>
                    <span className={profileStyle.statLabel}>Wins</span>
                </div>
            </div>
        </header>

        {/* CHILD ROUTES ----- <ProfileCompetitions/> & <ProfileSubmissions/> */}
        <div className={profileStyle.outletContainer}>
            <Outlet />
        </div>
    </>
    );
}
