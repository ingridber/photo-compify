import { getAllCompetitions, getCompetitionById, createCompetition, updateCompetition, deleteCompetition, searchCompetitions } from "../controllers/competitionsController";
import {authenticateToken} from "../middleware/auth";
import express from "express";
import { upload } from "../middleware/uploadMiddleware";

const routerComps = express.Router()

routerComps.get('/', getAllCompetitions);
routerComps.get('/:id', getCompetitionById);
routerComps.get("/", searchCompetitions);
routerComps.post('/', authenticateToken, upload.single("logoBaner"), createCompetition);
routerComps.patch('/:id', authenticateToken,  updateCompetition);
routerComps.delete('/:id', authenticateToken,  deleteCompetition);

export {routerComps};
