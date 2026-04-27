import { CompetitionInterface, AuthRequest } from "../types/index";
import { Request, Response } from "express";
import { Competition } from "../models/Competition";

// ---------------------------------------
// --------- GET ALL COMPETITION ---------
// ---------------------------------------
export async function getAllCompetitions(req: Request, res: Response) {
    const competitions = await Competition.find()
    if (!competitions) return res.status(404).json({
        code: "NO_COMPETITIONS_FOUND",
        message: "Could not find any competitions",
        status: 404
    })

    res.status(200).json(competitions);
}

// -----------------------------------------
// --------- GET COMPETITION BY ID ---------
// -----------------------------------------
export async function getCompetitionById(req: Request, res: Response) {
    const id = req.params.id;
    const competition = await Competition.findById(id).populate("owner", "username");

    if (!competition) {
        return res.status(404).json({
            code: 'COMPETITION_NOT_FOUND',
            message: 'The requested competition was not found',
            status: 404
        })
    };

    const now = new Date();
    if (competition.votingStartDate <= now) {
        await competition.populate("submissions");
    };

    res.status(200).json(competition);
};

// --------------------------------------
// --------- CREATE COMPETITION ---------
// --------------------------------------
export async function createCompetition(req: AuthRequest, res: Response) {
    const { title, description, themes } = req.body;

    if (!title || !description || !themes) {
        return res.status(400).json({
            code: 'MISSING_DATA',
            message: 'One or more required fields are missing',
            status: 400
        })
    };

    // ----- INPUT VALIDATION -----
    if (title.length > 50 || description.length > 250) {
        // IMPLEMENT CHARACTER CHECK 
        return res.status(400).json({
            code: 'CHARACTER_LIMIT_EXCEEDED',
            message: "Exceeded character limit for title or description",
            status: 400
        })
    };

    // !!! NEED VALIDATION IN FUTURE !!!
    const competition = await Competition.create({
        owner: req.user!.id,
        title: title,
        description: description,
        themes: themes,
    });

    res.status(201).json(competition);
};

// --------------------------------------
// --------- UPDATE COMPETITION ---------
// --------------------------------------
export async function updateCompetition(req: AuthRequest, res: Response) {
    const { title, description, themes } = req.body;

    // ----- INPUT VALIDATION -----
    if (title && title.length > 50) {
        // IMPLEMENT CHARACTER CHECK 
        return res.status(400).json({
            code: 'CHARACTER_LIMIT_EXCEEDED',
            message: "Exceeded character limit for title",
            status: 400
        })
    };

    if (description && description.length > 250) {
        // IMPLEMENT CHARACTER CHECK 
        return res.status(400).json({
            code: 'CHARACTER_LIMIT_EXCEEDED',
            message: "Exceeded character limit for description",
            status: 400
        })
    };

    try {
        const competition = await Competition.findById(req.params.id);

        if (!competition) {
            return res.status(404).json({
                code: 'COMPETITION_NOT_FOUND',
                message: 'The requested competition was not found',
                status: 404
            })
        };

        if (competition.owner.toString() !== req.user!.id) {
            return res.status(403).json({
                code: "FORBIDDEN",
                message: "You are not the owner of the competition",
                status: 403
            })
        };

        const updates: Partial<CompetitionInterface> = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (themes) updates.themes = themes;
        const updated = await Competition.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({
            code: "INTERNAL_SERVER_ERROR",
            message: "something went wrong",
            status: 500
        })
    }
};

// --------------------------------------
// --------- DELETE COMPETITION ---------
// --------------------------------------
export async function deleteCompetition(req: AuthRequest, res: Response) {

    try {
        const competition = await Competition.findById(req.params.id);

        if (!competition) {
            return res.status(404).json({
                code: 'COMPETITION_NOT_FOUND',
                message: 'The requested competition was not found',
                status: 404
            })
        };

        if (competition.owner.toString() !== req.user!.id) {
            return res.status(403).json({
                code: "FORBIDDEN",
                message: "You are not the owner of the competition",
                status: 403
            })
        };

        await Competition.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({
            code: "INTERNAL_SERVER_ERROR",
            message: "something went wrong",
            status: 500
        })
    }
};

// ----------------------------------------------------
// --------- ACTIVE & HISTORICAL COMPETITIONS ---------
// ----------------------------------------------------
export async function searchCompetitions(req: Request, res: Response) {
    const search = req.query.search as string | undefined;

    try {
        const query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

        const competitions = await Competition.find(query);
        const now = new Date();

        const activeCompetitions = competitions
            .filter(c => c.endDate > now)
            .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

        const historicalCompetitions = competitions
            .filter(c => c.endDate <= now)
            .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

        res.status(200).json({
            activeCompetitions,
            historicalCompetitions
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            status: 500
        });
    }
};
