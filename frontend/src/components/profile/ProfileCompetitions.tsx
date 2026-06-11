import { useEffect, useState } from "react";
import { getUserComps } from "../../services/user";
import CompetitionsProfileCard from "../competitions/CompetitionsProfileCard";
import { Throbber } from "../user-feedback/Throbber";
import type { Competition, Phase } from "../../types/competitions";
import profileStyle from "./profile.module.css";

export default function ProfileCompetitions() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCompetitions() {
            try {
                const result = await getUserComps();
                setCompetitions(result.competitions);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Failed to load competitions");
                }
            } finally {
                setLoading(false);
            }
        }
        loadCompetitions();
    }, []);

    if (loading) { return <Throbber />; }
    if (error) { return <p className={profileStyle.emptyText}>{error}</p>; }

    return (
    <div className={profileStyle.competitionsGrid}>
        {competitions.length > 0 ? (
            [...competitions]
                .sort((a, b) => {
                    const phaseOrder: Record<Phase, number> = {
                        voting: 0,
                        submission: 1,
                        ended: 2,
                    };

                    return phaseOrder[a.phase] - phaseOrder[b.phase];
                })
                .map((competition, i) => (
                    <div
                        className={profileStyle.competitionItem}
                        key={competition._id}
                        style={{ animationDelay: `${i * 80}ms` }}>
                        <CompetitionsProfileCard competition={competition} />
                    </div>
                ))
        ) : (
            <p className={profileStyle.emptyText}>No competitions hosted yet</p>
        )}
    </div>
    );
}
