import { Competition } from "../../models/Competition";
import { CompetitionInterface } from "../../types";
import { PhaseCheckResult } from "./competitionPhaseChecker";
import { getCompWinners } from "./getCompWinners";
import { Notification } from "../../models/Notification";

export async function competitionPhaseHandler(
    comp: CompetitionInterface,
    { previousPhase, currentPhase }: PhaseCheckResult
): Promise<void> {

    if (previousPhase === 'submission' && currentPhase === 'voting') {
        const votingNotifications = comp.submissions.map((submission: any) => {
            return {
                user: submission.user, 
                competition: comp._id,
                title: "Voting has started! 🗳️",
                description: `You can now vote for your favorite submission in ${comp.title}!`,
                phase: currentPhase
            };
        });

        await Notification.insertMany(votingNotifications);
        
        await Notification.create({
            user: comp.owner,
            competition: comp._id,
            title: "Voting has started!",
            description: `Voting has now opened for your competition: ${comp.title}`,
            phase: currentPhase
        });
    }

    if (previousPhase === 'voting' && currentPhase === 'ended') {
        const winners = await getCompWinners(comp);
        await Competition.findOneAndUpdate(
            { _id: comp._id },
            { $set: { winners } }
        );

        const endedNotifications = comp.submissions.map((submission: any) => {
            const isWinner = winners.includes(submission.user);

            return {
                user: submission.user,
                competition: comp._id,
                title: isWinner ? "You won the competition! 🎉" : "Competition is now over",
                description: isWinner
                    ? `Congratulations! Your submission to ${comp.title} won!`
                    : `Voting is over for ${comp.title}. Go and look who won.`,
                phase: currentPhase
            };
        });

        await Notification.insertMany(endedNotifications);
    }
}