import { CompetitionInterface, CompetitionSubmissionInterface } from "../../types";
import { Types } from "mongoose";

//magic array shuffle array from our friend the llm
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp: T = array[i] as T;
        array[i] = array[j] as T;
        array[j] = temp;
    }
    return array;
}

export async function getCompWinners(comp: CompetitionInterface): Promise<Types.ObjectId[]> {
    await comp.populate('submissions');

    const submissions = comp.submissions as CompetitionSubmissionInterface[];

    if (submissions.length === 0) return [];

    submissions.sort((a, b) => b.votes.length - a.votes.length);

    const groups = new Map<number, CompetitionSubmissionInterface[]>();
    for (const sub of submissions) {
        const count = sub.votes.length;
        if (!groups.has(count)) groups.set(count, []);
        groups.get(count)!.push(sub);
    }

    const winners: Types.ObjectId[] = [];
    const sortedVoteCounts = [...groups.keys()].sort((a, b) => b - a);

    for (const count of sortedVoteCounts) {
        if (winners.length >= 3) break;

        const group = groups.get(count)!;
        const slotsRemaining = 3 - winners.length;

        if (group.length === 1 && group[0]) {
            winners.push(group[0].user as Types.ObjectId);
        } else if (group.length <= slotsRemaining) {
            for (const sub of shuffleArray(group)) {
                winners.push(sub.user as Types.ObjectId);
            }
        } else {
            for (const sub of shuffleArray(group).slice(0, slotsRemaining)) {
                winners.push(sub.user as Types.ObjectId);
            }
        }
    }

    return winners;
}
