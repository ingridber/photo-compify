import { getSubmission, createSubmission, deleteSubmission, updateSubmission, voteOnSubmission, removeVoteFromSubmission } from "../controllers/submissionsController";
import {authenticateToken} from "../middleware/auth";
import express from "express";

const submissionRouter = express.Router({ mergeParams: true });

submissionRouter.post('/', authenticateToken, createSubmission);

submissionRouter.get('/:id', getSubmission);
submissionRouter.patch('/:id', authenticateToken, updateSubmission);
submissionRouter.delete('/:id', authenticateToken, deleteSubmission);
submissionRouter.post('/:id/vote', authenticateToken, voteOnSubmission);
submissionRouter.delete('/:id/vote', authenticateToken, removeVoteFromSubmission);

export {submissionRouter}
