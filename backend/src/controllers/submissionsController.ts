import { AuthRequest } from "../types/index";
import { Request, Response } from "express";
import { Submission } from "../models/Submission";
import { Competition } from "../models/Competition";
import { supabase } from "../config/supabase";
import { Image } from "../models/Image";
import { Types } from "mongoose";

export async function getSubmission(req: Request, res: Response) {
    try {
        const submission = await Submission.findById(req.params.id).populate("user", "username");

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

export async function createSubmission(req: AuthRequest, res: Response) {
    try {
        const { imageId } = req.body;
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
            _id: { $in: competition.submissions as Types.ObjectId[] },
            user: req.user!.id,
        });

        if (existingSubmission) {
            return res.status(409).json({
                code: 'SUBMISSION_ALREADY_EXISTS',
                message: 'You have already submitted to this competition',
                status: 409,
            });
        }

        if (!imageId) {
            return res.status(400).json({
                code: 'IMAGE_MISSING',
                message: 'No image ID provided',
                status: 400,
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

        const newSubmission = await Submission.create({
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

export async function voteOnSubmission(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const submission = await Submission.findById(id);

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
    }

    if (submission.votes.some(v => v.toString() === req.user!.id)) {
        return res.status(409).json({
            code: 'ALREADY_VOTED',
            message: 'You have already voted on this submission',
        })
    };

    try {
        submission.votes.push(new Types.ObjectId(req.user!.id));
        await submission.save();
        return res.status(200).json({
            message: 'vote successful'
        });
    } catch (error) {
        return res.status(500).json({
            code: 'VOTE_FAILED',
            message: 'Unable to add vote to submission'
        })
    };
};

export async function removeVoteFromSubmission(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const submission = await Submission.findById(id);

    if (!submission) {
        return res.status(404).json({
            code: 'SUBMISSION_NOT_FOUND',
            message: 'could not find submission',
            status: 404,
        })
    };

    if (!submission.votes.some(v => v.toString() === req.user!.id)) {
        return res.status(404).json({
            code: 'VOTE_NOT_FOUND',
            message: 'No vote found',
        })
    };

    try {
        await Submission.updateOne(
            { _id: submission._id },
            { $pull: { votes: new Types.ObjectId(req.user!.id) } }
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
}

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

        if (submission.user.toString() !== req.user!.id) {
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

        await Competition.findByIdAndUpdate(submission.competition, {
            $pull: { submissions: submission._id }
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

export async function updateSubmission(req: AuthRequest, res: Response) {
    try {
        const { description } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({
                code: 'SUBMISSION_NOT_FOUND',
                message: 'Could not find submission',
                status: 404,
            })
        };

        if (submission.user.toString() !== req.user!.id) {
            return res.status(403).json({
                code: 'FORBIDDEN',
                message: 'You are not the owner of this submission',
                status: 403,
            })
        };

        if (description) submission.description = description;

        if (req.file) {
            const oldImageDoc = await Image.findById(submission.image);

            if (oldImageDoc) {
                await supabase.storage.from("images").remove([oldImageDoc.filename]);
                await Image.findByIdAndDelete(oldImageDoc._id);
            };

            const fileName = `${Date.now()}-${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from("images")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype
                });

            if (error) {
                return res.status(500).json({
                    code: 'IMAGE_UPLOAD_FAILED',
                    message: 'Failed to upload image',
                    status: 500,
                })
            };

            const newImageDoc = await Image.create({
                filename: data.path,
                uploadedAt: new Date(),
                fileSize: req.file.size,
                fileFormat: req.file.mimetype,
            });

            submission.image = newImageDoc._id;
        };

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
