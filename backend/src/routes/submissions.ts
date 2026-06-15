import { getSubmission, createSubmission, deleteSubmission, updateSubmission, voteOnSubmission, removeVoteFromSubmission } from "../controllers/submissionsController";
import {authenticateToken} from "../middleware/auth";
import express from "express";

const submissionRouter = express.Router({ mergeParams: true });

submissionRouter.post('/', authenticateToken, createSubmission);
// TODO: maybe split this out (review 8)
submissionRouter.get('/:id', getSubmission);
// TODO: upload-middleware -> orsakar review 14
submissionRouter.patch('/:id', authenticateToken, updateSubmission);
submissionRouter.delete('/:id', authenticateToken, deleteSubmission);
submissionRouter.post('/:id/vote', authenticateToken, voteOnSubmission);
submissionRouter.delete('/:id/vote', authenticateToken, removeVoteFromSubmission);

export {submissionRouter}
