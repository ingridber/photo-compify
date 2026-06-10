import express from "express";
import { upload } from "../middleware/uploadMiddleware";
import {authenticateToken, extractUser} from "../middleware/auth";
import { getAllCompetitions, getCompetitionById, createCompetition, updateCompetition, deleteCompetition, getFeaturedCompetitions } from "../controllers/competitionsController";

const routerComps = express.Router()

routerComps.get('/', getAllCompetitions);
routerComps.get('/featured', getFeaturedCompetitions);
routerComps.get('/:id', extractUser, getCompetitionById);
routerComps.post('/', authenticateToken, upload.single("logoBanner"), createCompetition);
routerComps.patch('/:id', authenticateToken,  updateCompetition);
routerComps.delete('/:id', authenticateToken,  deleteCompetition);

export {routerComps};