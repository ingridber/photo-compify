import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";

type Phase = CompetitionInterface['phase'];

export interface PhaseCheckResult {
    previousPhase: Phase;
    currentPhase: Phase;
}

export async function checkPhaseAndUpdate(comp: CompetitionInterface): Promise<PhaseCheckResult> {
    const now = new Date();

    let currentPhase: Phase;

    if (now >= comp.votingStartDate && now < comp.endDate) {
        currentPhase = 'voting';
    } else if (now >= comp.endDate) {
        currentPhase = 'ended';
    } else {
        currentPhase = 'submission';
    }

    const previous = await Competition.findOneAndUpdate(
        { _id: comp._id, phase: { $ne: currentPhase } },
        { $set: { phase: currentPhase } },
        { returnDocument: 'before' }
    );

    return {
        previousPhase: previous ? previous.phase : currentPhase,
        currentPhase
    };
}
