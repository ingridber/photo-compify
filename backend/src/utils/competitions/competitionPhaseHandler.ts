import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";
import { PhaseCheckResult } from "./competitionPhaseChecker";
import { getCompWinners } from "./getCompWinners";
import { Notification } from "../../models/Notification";

export async function competitionPhaseHandler(
    comp: CompetitionInterface & { submissions: any[] },
    { previousPhase, currentPhase }: PhaseCheckResult
): Promise<void> {

    if (previousPhase === 'submission' && currentPhase === 'voting') {
        
        const votingNotifications = comp.submissions
            .filter((sub: any) => sub && sub.user && sub.user.toString() !== comp.owner.toString())
            .map((sub: any) => ({
                user: sub.user,
                competition: comp._id,
                title: "Voting has started!",
                description: `You can now vote for your favorite submission in ${comp.title}!`,
                phase: currentPhase,
                read: false 
            }));

        if (votingNotifications.length > 0) {
            await Notification.insertMany(votingNotifications);
        }
        
        if (comp.owner) {
            await Notification.create({
                user: comp.owner,
                competition: comp._id,
                title: "Voting has started!",
                description: `Voting has now opened for your competition: ${comp.title}`,
                phase: currentPhase,
                read: false
            });
        }
    }

    if (previousPhase === 'voting' && currentPhase === 'ended') {
        const winners = await getCompWinners(comp);
        
        await Competition.findOneAndUpdate(
            { _id: comp._id },
            { $set: { winners } },
            { returnDocument: 'after' }
        );

        const endedNotifications = comp.submissions
            .filter((sub: any) => sub && sub.user && sub.user.toString() !== comp.owner.toString())
            .map((sub: any) => {
                const isWinner = winners.includes(sub._id.toString());
                return {
                    user: sub.user,
                    competition: comp._id,
                    title: isWinner ? "You won the competition!" : "Competition is now over",
                    description: isWinner ? `Congratulations! Your submission to ${comp.title} won!` : `Voting is over for ${comp.title}. Go and look who won.`,
                    phase: currentPhase,
                    read: false 
                };
            });

        if (endedNotifications.length > 0) {
            await Notification.insertMany(endedNotifications);
        }

        if (comp.owner) {
            await Notification.create({
                user: comp.owner,
                competition: comp._id,
                title: "Competition ended",
                description: `Your competition ${comp.title} has ended. Winners have been announced!`,
                phase: currentPhase,
                read: false
            });
        }
    }
}