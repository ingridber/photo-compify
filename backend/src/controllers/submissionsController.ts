import type { AuthRequest, CompetitionSubmissionInterface, InterfaceUser } from "../types/index";
import type { Request, Response } from "express";
import { Submission } from "../models/Submission";
import { Competition } from "../models/Competition";
import { supabase } from "../config/supabase";
import { Image } from "../models/Image";
import { Types } from "mongoose";
import { CompetitionVote } from "../models/CompetitionVote";
import z from "zod";

export async function getSubmission(req: Request, res: Response) {
    try {
        const submission = await Submission.findById(req.params.id).populate<{ user: Pick<InterfaceUser, "_id" | "username"> }>("user", "username");

        if (!submission) {
            return res.status(404).json({
                code: 'SUBMISSION_NOT_FOUND',
                message: 'Could not find submission',
                status: 404,
            })
        };

        return res.status(200).json(submission);
    } catch (error) {
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong',
            status: 500,
        })
    }
};

const createSubmissionSchema = z.object({
    imageId: z.string({ error: "No image ID provided" })
})

export async function createSubmission(req: AuthRequest, res: Response) {
    const validation = createSubmissionSchema.safeParse(req.body);

    if (!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? "Validation failed";
        return res.status(400).json({ message });
    }

    try {
        const { imageId } = validation.data;
        const competitionId = req.params.competitionId;
        const competition = await Competition.findById(competitionId);

        if (!competition) {
            return res.status(404).json({
                code: 'COMPETITION_NOT_FOUND',
                message: 'The competition was not found',
                status: 404
            });
        }

        const now = new Date();

        if (now < competition.startDate || now >= competition.votingStartDate) {
            return res.status(400).json({
                code: 'NO_SUBMISSIONS_ACCEPTED',
                message: 'The competition is not accepting submissions',
                status: 400,
            });
        }

        const existingSubmission = await Submission.findOne({
            competition: competition._id,
            user: req.user!.id,
        });

        if (existingSubmission) {
            return res.status(409).json({
                code: 'SUBMISSION_ALREADY_EXISTS',
                message: 'You have already submitted to this competition',
                status: 409,
            });
        }

        const imageDoc = await Image.findById(imageId);

        if (!imageDoc) {
            return res.status(404).json({
                code: 'IMAGE_NOT_FOUND',
                message: 'The referenced image was not found',
                status: 404,
            });
        }

        const newSubmission: CompetitionSubmissionInterface = await Submission.create({
            user: req.user!.id,
            image: imageDoc._id,
            competition: competition._id,
        });

        (competition.submissions as Types.ObjectId[]).push(newSubmission._id);
        await competition.save();

        return res.status(201).json(newSubmission);
    } catch (error) {
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong',
            status: 500,
        });
    }
}

// TODO: review 6
export async function voteOnSubmission(req: AuthRequest, res: Response) {
    const id = req.params.id;
    let submission;
    let competition;

    try {
        submission = await Submission.findById(id);

        if (!submission) {
            return res.status(404).json({
                code: 'SUBMISSION_NOT_FOUND',
                message: 'could not find submission',
                status: 404,
            })
        };

        if (submission.user.toString() === req.user!.id) {
            return res.status(403).json({
                code: 'SELF_VOTE',
                message: 'You cannot vote on your own submission',
            });
        };

        competition = await Competition.findById(submission.competition);
        if (!competition) {
            return res.status(404).json({
                code: 'COMPETITION_NOT_FOUND',
                message: 'could not find competition',
                status: 404,
            });
        };

        const now = new Date();

        if (now < competition.votingStartDate || now >= competition.endDate) {
            return res.status(400).json({
                code: 'VOTING_CLOSED',
                message: 'The voting is closed',
                status: 400,
            });
        };

        const submissionsCount = await Submission.countDocuments({
            competition: competition._id,
            user: { $ne: req.user!.id },
        });

        const maxVotesAllowed = submissionsCount < 6 ? 1 : 3;

        await CompetitionVote.findOneAndUpdate(
            {
                user: req.user!.id,
                competition: competition._id,
                [`submissions.${maxVotesAllowed - 1}`]: { $exists: false },
                submissions: { $ne: submission._id }
            },
            { $addToSet: { submissions: submission._id } },
            { upsert: true, new: true }
        );

        await Submission.updateOne(
            { _id: submission._id },
            { $addToSet: { votes: req.user!.id } }
        );

        // TODO: någonting kan hända här review 6 ?, totalCount kan drifta med increase - 
        // samma limits på comp som på submissions
        await Competition.updateOne(
            { _id: competition._id },
            { $inc: { totalVoteCount: 1 } }
        );

        return res.status(200).json({
            message: 'vote successful'
        });
    } catch (error: any) {
        if (error.code === 11000 || error.codeName === 'DuplicateKey') {
            const existing = await CompetitionVote.findOne({
                user: req.user!.id,
                competition: competition!._id,
            });

            if (existing?.submissions.some(s => s.toString() === id)) {
                return res.status(409).json({
                    code: 'ALREADY_VOTED',
                    message: 'You have already voted on this submission',
                });
            }

            return res.status(403).json({
                code: 'VOTE_LIMIT_REACHED',
                message: 'You have reached the vote limit for this competition',
            });
        }
        return res.status(500).json({
            code: 'VOTE_FAILED',
            message: 'Unable to add vote to submission'
        })
    };
};

export async function removeVoteFromSubmission(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
        const submission = await Submission.findById(id);

        if (!submission) {
            return res.status(404).json({
                code: 'SUBMISSION_NOT_FOUND',
                message: 'could not find submission',
                status: 404,
            })
        };

        const result = await CompetitionVote.updateOne(
            { user: req.user!.id, competition: submission.competition as Types.ObjectId },
            { $pull: { submissions: submission._id } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                code: 'VOTE_NOT_FOUND',
                message: 'no vote found'
            })
        };

        await Submission.updateOne(
            { _id: submission._id },
            { $pull: { votes: new Types.ObjectId(req.user!.id) } }
        );
        await Competition.updateOne(
            { _id: submission.competition as Types.ObjectId },
            { $inc: { totalVoteCount: -1 } }
        );

        return res.status(200).json({
            message: 'Vote removed'
        });
    } catch (error) {
        return res.status(500).json({
            code: 'UNVOTE_FAILED',
            message: 'Unable to remove vote from submission'
        });
    }
};

export async function deleteSubmission(req: AuthRequest, res: Response) {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({
                code: 'SUBMISSION_NOT_FOUND',
                message: 'Could not find submission',
                status: 404,
            })
        };

        const isOwner = submission.user.toString() === req.user!.id;
        const isAdmin = req.user!.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                code: 'FORBIDDEN',
                message: 'You are not the owner of this submission',
                status: 403,
            })
        };

        const imageDoc = await Image.findById(submission.image);

        if (imageDoc) {
            await supabase.storage.from("images").remove([imageDoc.filename]);
            await Image.findByIdAndDelete(imageDoc._id);
        };
        await CompetitionVote.updateMany(
            { submissions: submission._id },
            { $pull: { submissions: submission._id } }
        );

        await Competition.findByIdAndUpdate(submission.competition, {
            $pull: { submissions: submission._id },
            $inc: { totalVoteCount: -submission.votes.length }
        });

        await Submission.findByIdAndDelete(submission._id);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong',
            status: 500,
        })
    }
};

const updateSubmissionSchema = z.object({
    imageId: z.string({ error: "No image ID provided" })
})

export async function updateSubmission(req: AuthRequest, res: Response) {
    const validation = updateSubmissionSchema.safeParse(req.body);

    if (!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? "Validation failed";
        return res.status(400).json({ message });
    }

    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({
                code: 'SUBMISSION_NOT_FOUND',
                message: 'Could not find submission',
                status: 404,
            })
        };

        const isOwner = submission.user.toString() === req.user!.id;
        const isAdmin = req.user!.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                code: 'FORBIDDEN',
                message: 'You are not the owner of this submission',
                status: 403,
            })
        };

        const { imageId } = validation.data;

        const newImageDoc = await Image.findById(imageId);

        if (!newImageDoc) {
            return res.status(404).json({
                code: 'IMAGE_NOT_FOUND',
                message: 'The referenced image was not found',
                status: 404,
            });
        };

        const oldImageDoc = await Image.findById(submission.image);

        if (oldImageDoc) {
            await supabase.storage.from("images").remove([oldImageDoc.filename]);
            await Image.findByIdAndDelete(oldImageDoc._id);
        };

        submission.image = newImageDoc._id;

        await submission.save();
        return res.status(200).json(submission);
    } catch (error) {
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong',
            status: 500,
        })
    }
};
