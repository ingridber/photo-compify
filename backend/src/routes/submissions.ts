import { getSubmission, createSubmission, deleteSubmission, updateSubmission, voteOnSubmission, removeVoteFromSubmission } from "../controllers/submissionsController";
import {authenticateToken} from "../middleware/auth";
import express from "express";
import { upload } from "../middleware/uploadMiddleware";

const submissionRouter = express.Router({ mergeParams: true });

submissionRouter.post('/', authenticateToken, upload.single("image"), createSubmission);

submissionRouter.get('/:id', getSubmission);
submissionRouter.patch('/:id', authenticateToken, upload.single("image"), updateSubmission);
submissionRouter.delete('/:id', authenticateToken, deleteSubmission);
submissionRouter.post('/:id/vote', authenticateToken, voteOnSubmission);
submissionRouter.delete('/:id/vote', authenticateToken, removeVoteFromSubmission);

export {submissionRouter}
