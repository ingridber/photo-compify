import { CompetitionInterface } from "../types/index";
import { Request, Response } from "express";
import { Competition } from "../models/Competition";


// ---------------------------------------
// --------- GET ALL COMPETITION ---------
// ---------------------------------------
export function getAllCompetitions(req: Request, res: Response) {
    res.status(200).json({data: mockCompetitions})
}

// -----------------------------------------
// --------- GET COMPETITION BY ID ---------
// -----------------------------------------
export function getCompetitionById(req: Request, res: Response){
    const competition = mockCompetitions.find( comp => comp.id === id);

    if (!competition) {
        return res.status(404).json({
            code: 'COMPETITION_NOT_FOUND',
            message: 'The requested competition was not found',
            status: 404
        })
    };

    res.json(competition);
};

// --------------------------------------
// --------- CREATE COMPETITION ---------
// --------------------------------------
export function createCompetition(req: Request, res: Response) {
    const {owner, title, description, themes} = req.body;
    
    if(!owner || !title || !description || !themes){
        return res.status(400).json({
            code: 'MISSING_DATA',
            message: 'One or more required fields are missing',
            status: 400
        })
    };

    // ----- INPUT VALIDATION -----
    if(title.length > 50 || description.length > 250){
        // IMPLEMENT CHARACTER CHECK 
        return res.status(400).json({
            code: 'CHARACTER_LIMIT_EXCEEDED',
            message: "Exceeded character limit for title or description",
            status: 400
        })
    };

    // SETTING END DATE TO DEAFUALT 7 days FROM INPUT VALUE
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 7);

    // !!! NEED VALIDATION IN FUTURE !!!
    const competition: CompetitionInterface = {
        id: mockCompetitions.length + 1,
        owner: owner, 
        title: title,
        description: description,
        themes: themes,
        submissionTimeLimit: 123,
        votingTimeLimit: 45,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        phase: 'submission',
        participantCount: 0,
        submissions: [],
        totalVoteCount: 0
    };

    mockCompetitions.push(competition);
    res.status(201).json(competition);
};

// --------------------------------------
// --------- UPDATE COMPETITION ---------
// --------------------------------------
export function updateCompetition(req: Request, res: Response) {
    //@ts-ignore
    const id = parseInt(req.params.id); // ID kommer ändras senare till string
    const competition = mockCompetitions.find( comp => comp.id === id);

    if (!competition) {
        return res.status(404).json({
            code: 'COMPETITION_NOT_FOUND',
            message: 'The requested competition was not found',
            status: 404
        })
    };

    const {title, description, themes} = req.body;

    // ----- INPUT VALIDATION -----
    if(title && title.length > 50){
        // IMPLEMENT CHARACTER CHECK 
        return res.status(400).json({
            code: 'CHARACTER_LIMIT_EXCEEDED',
            message: "Exceeded character limit for title",
            status: 400
        })
    };

    if(description && description.length > 250){
        // IMPLEMENT CHARACTER CHECK 
        return res.status(400).json({
            code: 'CHARACTER_LIMIT_EXCEEDED',
            message: "Exceeded character limit for description",
            status: 400
        })
    };

    // ----- SET NEW VALUES -----
    if(title) competition.title = title;
    if(description) competition.description = description;
    if(themes) competition.themes = themes;

    res.status(200).json({
        code: 'UPDATE_SUCCESS',
        message: 'Update successful',
        status: 200,
    });
};

// --------------------------------------
// --------- DELETE COMPETITION ---------
// --------------------------------------
export function deleteCompetition(req: Request, res: Response) {
    //@ts-ignore
    const id = parseInt(req.params.id); // ID kommer ändras senare till string
    const competition = mockCompetitions.find( comp => comp.id === id);

    if (!competition) {
        return res.status(404).json({
            code: 'COMPETITION_NOT_FOUND',
            message: 'The requested competition was not found',
            status: 404
        })
    };

    mockCompetitions = mockCompetitions.filter(c => c.id !== id)

    res.status(204).send();
};

// ----------------------------------------------------
// --------- ACTIVE & HISTORICAL COMPETITIONS ---------
// ----------------------------------------------------
export const searchCompetitions = (req: Request, res: Response) => {
    const search = req.query.search as string | undefined

    let filteredCompetitions: CompetitionInterface[] = mockCompetitions

    // Search by title or owner
    if (search) {
        const searchLower = search.toLowerCase()

        filteredCompetitions = filteredCompetitions.filter(c =>
            c.title.toLowerCase().includes(searchLower) ||
            c.owner.toLowerCase().includes(searchLower)
        )
    }

    // Active competitions
    const activeCompetitions = filteredCompetitions
        .filter(c => c.phase !== "ended")
        .sort((a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        )

    // Historical competitions
    const historicalCompetitions = filteredCompetitions
        .filter(c => c.phase === "ended")
        .sort((a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        )

    res.json({
        activeCompetitions,
        historicalCompetitions
    })
}
