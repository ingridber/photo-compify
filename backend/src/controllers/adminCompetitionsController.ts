import { Request, Response } from "express";
import { Competition } from "../models/Competition";
import { getPagination } from "../utils/competitions/pagination";

//---------------------------------------
//--------adminGetAllCompetitions--------
//---------------------------------------
export async function adminGetAllCompetitions(req: Request, res: Response) {
    try {
        // Gets pagination values from the query parameters
        const { page, limit, skip } = getPagination(req.query);
        // Gets search term from query parameters
        const search = req.query.search as string | undefined;

        // Gets role filter from the query parameters
        const phase = req.query.phase as | "submission" | "voting" | "ended" | undefined;

        // Dont return competitions if nothing is searched
        if (!search?.trim() && !phase) {
            return res.status(200).json({
                competitions: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 1,
                },
            });
        }

        // Creates an empty filter object
        const filter: any = {};

        const hasSearch = search?.trim();
        const hasPhase = !!phase;

        // Status filter
        if(hasPhase) {
            filter.phase = phase;
        }

        // If search term is provided
        if(hasSearch) {
            // Searches title, description using a case-insensitive regex
            filter.$or = [
                { title: { $regex: hasSearch, $options: "i" } },
                { description: { $regex: hasSearch, $options: "i" } },
            ];
        }

        // Gets competitions from database
        // Sorts competitions based on phase submission | voting | ended, and newest competitions show first
        // Skips documents based on pagination
        // Limits the number of returned documents
        const competitions = await Competition.aggregate([
            {$match: filter},
            {
                $addFields: {
                    phaseOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$phase", "submission"] }, then: 1 },
                                { case: { $eq: ["$phase", "voting"] }, then: 2 },
                                { case: { $eq: ["$phase", "ended"] }, then: 3 },
                            ],
                            default: 4,
                        },
                    },
                },
            },
            { $sort: { phaseOrder: 1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        // Counts the total number of users matching the filter
        const total = await Competition.countDocuments(filter);

        // Calculates the total number of pages
        const totalPages = Math.max(1, Math.ceil(total / limit));

        // Returns competitions with pagination information
        return res.status(200).json({
            competitions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch(error) {
        return res.status(500).json({message: "Something went wrong"});
    }
}

//---------------------------------------
//--------adminUpdateCompetitions--------
//---------------------------------------
export async function adminUpdateCompetitions(req: Request, res: Response) {
    try {
        const { title, phase } = req.body;
        const allowedPhases = ["submission", "voting", "ended"];

        // Validation
        if(phase && !allowedPhases.includes(phase)) {
            return res.status(400).json({
                message: "Invalid phase",
            });
        }

        const updateData: any = {};

        if(title !== undefined) updateData.title = title;
        if(phase !== undefined) updateData.phase = phase;

        const competition = await Competition.findByIdAndUpdate(req.params.id, updateData, {new: true});
        if(!competition) {
            return res.status(404).json({
                message: "Competition not found",
            });
        }

        return res.status(200).json(competition);
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}