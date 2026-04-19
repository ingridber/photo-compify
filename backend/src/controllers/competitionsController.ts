import { CompetitionInterface } from "../types/index";
import { Request, Response } from "express";

let mockCompetitions: CompetitionInterface[] = [
    {
        id: 1,
        owner: "alice_dev",
        title: "Spring UI Challenge",
        description: "Design a responsive dashboard UI using only CSS and HTML.",
        themes: ["UI", "CSS", "Frontend"],
        submissionTimeLimit: 72,
        votingTimeLimit: 48,
        startDate: "2026-03-01T00:00:00Z",
        endDate: "2026-03-10T00:00:00Z",
        phase: "ended",
        participantCount: 34,
        submissions: [],
        totalVoteCount: 128,
    },{
        id: 2,
        owner: "bob_creates",
        title: "AI Prompt Art Fest",
        description: "Generate the most creative artwork using AI prompts.",
        themes: ["AI", "Art", "Creativity"],
        submissionTimeLimit: 48,
        votingTimeLimit: 24,
        startDate: "2026-04-01T00:00:00Z",
        endDate: "2026-04-15T00:00:00Z",
        phase: "voting",
        participantCount: 61,
        submissions: [],
        totalVoteCount: 305,
    },{
        id: 3,
        owner: "carol_codes",
        title: "Hackathon: Climate Tech",
        description: "Build a tool that addresses a climate change problem.",
        themes: ["Climate", "Sustainability", "Tech"],
        submissionTimeLimit: 96,
        votingTimeLimit: 72,
        startDate: "2026-04-10T00:00:00Z",
        endDate: "2026-04-20T00:00:00Z",
        phase: "submission",
        participantCount: 22,
        submissions: [],
        totalVoteCount: 0,
    },{
        id: 4,
        owner: "dan_designs",
        title: "Logo Design Blitz",
        description: "Create a logo for a fictional startup in under an hour.",
        themes: ["Design", "Branding", "Logo"],
        submissionTimeLimit: 1,
        votingTimeLimit: 24,
        startDate: "2026-02-14T00:00:00Z",
        endDate: "2026-02-16T00:00:00Z",
        phase: "ended",
        participantCount: 19,
        submissions: [],
        totalVoteCount: 87,
    },{
        id: 5,
        owner: "eve_builds",
        title: "Open Source Sprint",
        description: "Contribute a meaningful feature to any open source project.",
        themes: ["Open Source", "Collaboration", "Code"],
        submissionTimeLimit: 120,
        votingTimeLimit: 48,
        startDate: "2026-04-12T00:00:00Z",
        endDate: "2026-04-30T00:00:00Z",
        phase: "submission",
        participantCount: 45,
        submissions: [],
        totalVoteCount: 0,
    },
];

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