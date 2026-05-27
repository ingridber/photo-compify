import { Competition } from "../../models/Competition";
import { checkPhaseAndUpdate } from "./competitionPhaseChecker";
import { competitionPhaseHandler } from "./competitionPhaseHandler";

const INTERVAL_MS = 60_000;

async function runSchedulerTick(): Promise<void> {
    const competitions = await Competition.find({ phase: { $ne: 'ended' } });

    for (const comp of competitions) {
        const result = await checkPhaseAndUpdate(comp);

        if (result.previousPhase !== result.currentPhase) {
            await competitionPhaseHandler(comp, result);
        }
    }
}

export function startCompetitionScheduler(): void {
    console.log('[competitionScheduler] started');

    setInterval(async () => {
        try {
            await runSchedulerTick();
        } catch (err) {
            console.error('[competitionScheduler] tick failed — possible DB issue:', err);
        }
    }, INTERVAL_MS);
}
