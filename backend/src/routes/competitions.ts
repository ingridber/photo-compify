import { getAllCompetitions, getCompetitionById, createCompetition, updateCompetition, deleteCompetition, searchCompetitions } from "../controllers/competitionsController";
import express from "express";

const routerComps = express.Router()

routerComps.get('/', getAllCompetitions);
routerComps.get('/:id', getCompetitionById);
routerComps.get("/competitions", searchCompetitions);
routerComps.post('/', createCompetition);
routerComps.patch('/:id', updateCompetition);
routerComps.delete('/:id', deleteCompetition);

export {routerComps};