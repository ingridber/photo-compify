jest.mock("../models/Competition", () => ({
    Competition: {
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
    },
}));

jest.mock("../models/User", () => ({
    User: { modelName: "User" },
}));

jest.mock("../controllers/competitionsQuery", () => ({
    buildCompetitionQuery: jest.fn(),
}));

jest.mock("../utils/validationHelpers", () => {
    const { z } = jest.requireActual<typeof import("zod")>("zod");

    return {
        requiredString: (message: string) => z.string({ error: message }),
    };
});

import { Types } from "mongoose";
import { Competition } from "../models/Competition";
import { User } from "../models/User";
import { buildCompetitionQuery } from "../controllers/competitionsQuery";
import {
    adminSetCompetitionPhase,
    createCompetition,
    deleteCompetition,
    getAllCompetitions,
    getCompetitionById,
    updateCompetition,
} from "../controllers/competitionsController";

type MockResponse = {
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
};

const CompetitionMock = Competition as unknown as {
    create: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
};

const buildCompetitionQueryMock = buildCompetitionQuery as jest.Mock;

function mockResponse(): MockResponse {
    const res: MockResponse = {
        status: jest.fn(),
        json: jest.fn(),
        send: jest.fn(),
    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    res.send.mockReturnValue(res);

    return res;
}

function mockFindByIdPopulateResult(result: unknown) {
    const query = {
        populate: jest.fn(),
    };

    query.populate.mockReturnValueOnce(query).mockResolvedValueOnce(result);
    CompetitionMock.findById.mockReturnValueOnce(query);

    return query;
}

function makeSubmission(userId: Types.ObjectId | string, signedUrl: string) {
    const submission: any = {
        user: { _id: userId, username: `user-${userId.toString()}` },
        image: { getSignedUrl: jest.fn().mockResolvedValue(signedUrl) },
        set: jest.fn((path: string, value: unknown) => {
            submission[path] = value;
        }),
    };

    return submission;
}

describe("competitionsController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("getAllCompetitions", () => {
        it("returns the built competition query result", async () => {
            const req = { query: { page: "1" } } as any;
            const res = mockResponse();
            const result = { competitions: [], total: 0 };
            buildCompetitionQueryMock.mockResolvedValueOnce(result);

            await getAllCompetitions(req, res as any);

            expect(buildCompetitionQueryMock).toHaveBeenCalledWith(req, User, Competition);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("returns 500 when the query builder throws", async () => {
            const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
            const req = {} as any;
            const res = mockResponse();
            buildCompetitionQueryMock.mockRejectedValueOnce(new Error("db failed"));

            await getAllCompetitions(req, res as any);

            expect(consoleError).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
        });
    });

    describe("getCompetitionById", () => {
        it("returns 400 when params.id is missing", async () => {
            const req = { params: {} } as any;
            const res = mockResponse();

            await getCompetitionById(req, res as any);

            expect(CompetitionMock.findById).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                code: "COMPETITION_NOT_FOUND",
                message: "The request competition was not found",
                status: 400,
            });
        });

        it("returns 404 when no competition exists", async () => {
            const id = new Types.ObjectId().toString();
            const req = { params: { id } } as any;
            const res = mockResponse();

            mockFindByIdPopulateResult(null);

            await getCompetitionById(req, res as any);

            expect(CompetitionMock.findById).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                code: "COMPETITION_NOT_FOUND",
                message: "The requested competition was not found",
                status: 404,
            });
        });

        it("signs the logo and all submission images when voting has started", async () => {
            const id = new Types.ObjectId().toString();
            const submissionA = makeSubmission(new Types.ObjectId(), "signed-a");
            const submissionB = makeSubmission(new Types.ObjectId(), "signed-b");
            const competition: any = {
                logoBanner: { getSignedUrl: jest.fn().mockResolvedValue("signed-logo") },
                populate: jest.fn().mockResolvedValue(undefined),
                signedLogoUrl: undefined,
                submissions: [submissionA, submissionB],
                votingStartDate: new Date(Date.now() - 1_000),
            };
            const req = { params: { id } } as any;
            const res = mockResponse();

            const query = mockFindByIdPopulateResult(competition);

            await getCompetitionById(req, res as any);

            expect(query.populate).toHaveBeenNthCalledWith(1, "owner", "username");
            expect(query.populate).toHaveBeenNthCalledWith(2, "logoBanner");
            expect(competition.populate).toHaveBeenCalledWith({
                path: "submissions",
                populate: [
                    { path: "image" },
                    { path: "user", select: "username" },
                ],
            });
            expect(competition.signedLogoUrl).toBe("signed-logo");
            expect(submissionA.set).toHaveBeenCalledWith("signedImageUrl", "signed-a", { strict: false });
            expect(submissionB.set).toHaveBeenCalledWith("signedImageUrl", "signed-b", { strict: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(competition);
        });

        it("signs only the authenticated user's own submission before voting starts", async () => {
            const id = new Types.ObjectId().toString();
            const ownerId = new Types.ObjectId();
            const viewerId = new Types.ObjectId();
            const ownerSubmission = makeSubmission(ownerId, "signed-owner");
            const viewerSubmission = makeSubmission(viewerId, "signed-viewer");
            const competition: any = {
                logoBanner: null,
                populate: jest.fn().mockResolvedValue(undefined),
                submissions: [ownerSubmission, viewerSubmission],
                votingStartDate: new Date(Date.now() + 60_000),
            };
            const req = {
                params: { id },
                user: { id: viewerId.toString(), role: "user" },
            } as any;
            const res = mockResponse();

            mockFindByIdPopulateResult(competition);

            await getCompetitionById(req, res as any);

            expect(ownerSubmission.image.getSignedUrl).not.toHaveBeenCalled();
            expect(ownerSubmission.set).not.toHaveBeenCalled();
            expect(viewerSubmission.set).toHaveBeenCalledWith("signedImageUrl", "signed-viewer", { strict: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(competition);
        });
    });

    describe("createCompetition", () => {
        it("creates a competition with the authenticated user as owner", async () => {
            const logoBanner = new Types.ObjectId().toString();
            const created = { _id: new Types.ObjectId(), title: "Summer Theme" };
            const req = {
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: {
                    title: "Summer Theme",
                    description: "A valid description",
                    themes: ["nature"],
                    logoBanner,
                },
            } as any;
            const res = mockResponse();
            CompetitionMock.create.mockResolvedValueOnce(created);

            await createCompetition(req, res as any);

            const payload = CompetitionMock.create.mock.calls[0][0];
            expect(payload).toEqual({
                owner: req.user.id,
                title: "Summer Theme",
                description: "A valid description",
                themes: ["nature"],
                logoBanner: expect.any(Types.ObjectId),
            });
            expect(payload.logoBanner.toString()).toBe(logoBanner);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it("returns 400 and does not create when required data is invalid", async () => {
            const req = {
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: {
                    title: "No",
                    description: "A valid description",
                    themes: ["nature"],
                },
            } as any;
            const res = mockResponse();

            await createCompetition(req, res as any);

            expect(CompetitionMock.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                code: "MISSING_DATA",
                message: "Title must be between 3 and 50 characers",
                status: 400,
            });
        });

        it("returns 400 when logoBanner is not a valid ObjectId", async () => {
            const req = {
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: {
                    title: "Valid title",
                    description: "A valid description",
                    themes: ["nature"],
                    logoBanner: "not-an-object-id",
                },
            } as any;
            const res = mockResponse();

            await createCompetition(req, res as any);

            expect(CompetitionMock.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                code: "MISSING_DATA",
                message: "Invalid logo banner image id",
                status: 400,
            });
        });
    });

    describe("updateCompetition", () => {
        it("returns 400 when update data is invalid", async () => {
            const req = {
                params: { id: new Types.ObjectId().toString() },
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: { title: "No" },
            } as any;
            const res = mockResponse();

            await updateCompetition(req, res as any);

            expect(CompetitionMock.findById).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Title must be between 3 and 50 characers" });
        });

        it("returns 404 when the competition does not exist", async () => {
            const req = {
                params: { id: new Types.ObjectId().toString() },
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: { title: "Updated title" },
            } as any;
            const res = mockResponse();
            CompetitionMock.findById.mockResolvedValueOnce(null);

            await updateCompetition(req, res as any);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                code: "COMPETITION_NOT_FOUND",
                message: "The requested competition was not found",
                status: 404,
            });
        });

        it("returns 403 when the requester is neither owner nor admin", async () => {
            const req = {
                params: { id: new Types.ObjectId().toString() },
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: { title: "Updated title" },
            } as any;
            const res = mockResponse();
            CompetitionMock.findById.mockResolvedValueOnce({ owner: new Types.ObjectId() });

            await updateCompetition(req, res as any);

            expect(CompetitionMock.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                code: "FORBIDDEN",
                message: "You are not the owner of the competition",
                status: 403,
            });
        });

        it("lets an admin clear logoBanner", async () => {
            const id = new Types.ObjectId().toString();
            const updated = { _id: id, logoBanner: null };
            const req = {
                params: { id },
                user: { id: new Types.ObjectId().toString(), role: "admin" },
                body: { logoBanner: null },
            } as any;
            const res = mockResponse();
            CompetitionMock.findById.mockResolvedValueOnce({ owner: new Types.ObjectId() });
            CompetitionMock.findByIdAndUpdate.mockResolvedValueOnce(updated);

            await updateCompetition(req, res as any);

            expect(CompetitionMock.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                { $set: { logoBanner: null } },
                { new: true },
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });
    });

    describe("deleteCompetition", () => {
        it("deletes a competition when the requester is the owner", async () => {
            const ownerId = new Types.ObjectId();
            const id = new Types.ObjectId().toString();
            const req = {
                params: { id },
                user: { id: ownerId.toString(), role: "user" },
            } as any;
            const res = mockResponse();
            CompetitionMock.findById.mockResolvedValueOnce({ owner: ownerId });
            CompetitionMock.findByIdAndDelete.mockResolvedValueOnce({ _id: id });

            await deleteCompetition(req, res as any);

            expect(CompetitionMock.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalledWith();
        });

        it("returns 403 when the requester is neither owner nor admin", async () => {
            const req = {
                params: { id: new Types.ObjectId().toString() },
                user: { id: new Types.ObjectId().toString(), role: "user" },
            } as any;
            const res = mockResponse();
            CompetitionMock.findById.mockResolvedValueOnce({ owner: new Types.ObjectId() });

            await deleteCompetition(req, res as any);

            expect(CompetitionMock.findByIdAndDelete).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                code: "FORBIDDEN",
                message: "You are not the owner of the competition",
                status: 403,
            });
        });
    });

    describe("adminSetCompetitionPhase", () => {
        it("returns 403 for non-admin users", async () => {
            const req = {
                params: { id: new Types.ObjectId().toString() },
                user: { id: new Types.ObjectId().toString(), role: "user" },
                body: { phase: "voting" },
            } as any;
            const res = mockResponse();

            await adminSetCompetitionPhase(req, res as any);

            expect(CompetitionMock.findById).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Admin only" });
        });

        it("returns 400 for an invalid phase", async () => {
            const req = {
                params: { id: new Types.ObjectId().toString() },
                user: { id: new Types.ObjectId().toString(), role: "admin" },
                body: { phase: "archived" },
            } as any;
            const res = mockResponse();

            await adminSetCompetitionPhase(req, res as any);

            expect(CompetitionMock.findById).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid phase" });
        });

        it("updates and saves the competition phase for an admin", async () => {
            const id = new Types.ObjectId().toString();
            const competition: any = {
                phase: "submission",
                save: jest.fn().mockResolvedValue(undefined),
            };
            const req = {
                params: { id },
                user: { id: new Types.ObjectId().toString(), role: "admin" },
                body: { phase: "voting" },
            } as any;
            const res = mockResponse();
            CompetitionMock.findById.mockResolvedValueOnce(competition);

            await adminSetCompetitionPhase(req, res as any);

            expect(competition.phase).toBe("voting");
            expect(competition.save).toHaveBeenCalledWith();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Phase updated",
                competition,
            });
        });
    });
});
