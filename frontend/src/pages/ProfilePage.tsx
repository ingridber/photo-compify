import { useUser } from "../hooks/useUser";
import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import mixins from "../styles/mixins.module.css";
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
            {/* HEADER */}
            <section className={mixins.headerContainer}>
                <p 
                    className={mixins.username}
                    onClick={() => navigate("/profile")}>
                        {user ? user.username : "USER"}
                </p>
                <div
                    className={profileStyle.pictureContainer}
                    onClick={() => navigate("/profile")}
                >
                    <DisplayProfilePicture src={user?.profilePicture?.url}/>
                </div>
            </section>


            <button>
                <img
                    src={!showEdit? "/edit-pencil.svg" : "/close.svg"}
                    alt="edit profile icon"
                    style={{width:"30px"}}
                    onClick={() => setShowEdit(!showEdit)}
                />
            </button>


        {/* ----- CAMERA AND THEMES DETAILS ----- */}
            <section className={profileStyle.profileDetailsContainer}>
                { showEdit ? (
                    <ProfileEditDetails 
                        handleSave={() => setShowEdit(false)}/>
                ):(
                    <>
                    <div className={profileStyle.detailsContainer}>
                        <img src="/camera-detail.svg" alt="camera icon" className={profileStyle.detailsIcon}/>
                        <p className={profileStyle.detailsText}>
                            {user?.camera? user.camera : "Not specified"}</p>
                    </div>

                    <div className={profileStyle.detailsContainer}>
                        <img src="/theme-detail.svg" alt="theme icon" className={profileStyle.detailsIcon}/>

                        {user?.themes && user.themes.length > 0 ? (
                            user.themes.map((theme) => {
                
                            const safeTheme = theme ?? "Default";
                            const themeClass = `${safeTheme
                                .replace(/\s+/g, "")
                                .replace(/&/g, "")}Color`;

                            return (
                                <span
                                className={`${profileStyle.theme} ${profileStyle[themeClass]}`}
                                key={safeTheme}
                                >
                                {safeTheme}
                                </span>
                            );
                        })
                        ) : (
                            <span className={profileStyle.detailsText}>Not specified</span>
                        )}
                    </div>
                    </>
                )}
            </section>

            {/* STATS */}
            <section className={profileStyle.profileStatsContainer}>
                <div 
                    className={`${profileStyle.statContainer} ${profileStyle.competitionsContainer}`}
                    onClick={() => navigate("/profile/competitions")}>
                        <p className={profileStyle.statTitle}>Host</p>
                        <p className={profileStyle.statValue}>{stats.competitionsCreated}</p>
                </div>
                 <div 
                    className={`${profileStyle.statContainer} ${profileStyle.submissionContainer}`}
                    onClick={() => navigate("/profile")}>
                        <p className={profileStyle.statTitle}>Submissions</p>
                        <p className={profileStyle.statValue}>{stats.submissions}</p>
                </div>
                <div className={profileStyle.statContainer}>
                    <p className={profileStyle.statTitle}>Wins</p>
                    <p className={profileStyle.statValue}>{stats.wins}</p>
                </div>
            </section>


            {/* CHILD ROUTES */}
            <Outlet />

        </>
    );
}