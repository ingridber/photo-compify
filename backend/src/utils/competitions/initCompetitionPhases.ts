import { Competition } from "../../models/Competition";
import { checkPhaseAndUpdate } from "./competitionPhaseChecker";
import { competitionPhaseHandler } from "./competitionPhaseHandler";

export async function initCompetitionPhases() {
    try {
        const competitions = await Competition.find({ phase: { $ne: 'ended' } });

        for (const comp of competitions) {
            const now = Date.now();
            const phase = await checkPhaseAndUpdate(comp);
            if (phase === 'submission') {
                setTimeout( () => {
                   competitionPhaseHandler(comp);
                }, comp.votingStartDate.getTime() - now)
            };
            if (phase === 'voting') {
                setTimeout(() => {
                    competitionPhaseHandler(comp);
                }, comp.endDate.getTime() - now)
            };
        };
    } catch (err) {
        throw err
    };
};
