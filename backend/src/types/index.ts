import {Document, Types} from "mongoose";
import { Request } from "express";
import { ZodTupleItems } from "zod/v3";

export type UserRole = | "user" | "moderator" | "admin";

export interface InterfaceUser extends Document {
    name: string;
    email?: string;
    username: string;
    password: string;
    role: UserRole;
    profilePicture?: Types.ObjectId | null;
    warnings: number;
    loginAttempts: number;
    lockUntil: Date | undefined;
    camera?: string | null;
    themes?: string[] | null;
};

export interface CompetitionInterface extends Document {
    owner: Types.ObjectId;
    title: string;
    logoBanner?: LogoBanner;
    description: string;
    themes: string[];
    startDate: Date;
    votingStartDate: Date;
    endDate: Date;
    submissions: Types.ObjectId[] | CompetitionSubmissionInterface[];
    totalVoteCount: number;
    phase: 'submission' | 'voting' | 'ended';
    winners: Types.ObjectId[];
    signedLogoUrl?: string;
};

interface LogoBanner {
    id: Types.ObjectId;
    getSignedUrl(): Promise<string>;
}

export interface CompetitionSubmissionInterface extends Document {
    competition: Types.ObjectId | CompetitionInterface ;
    user: Types.ObjectId;
    image: SubmissionImage;
    description?: string;
    votes: Types.ObjectId[];
};

interface SubmissionImage {
    id: Types.ObjectId;
    filename: string;
    getSignedUrl(): Promise<string>;
}

export interface ImageInterface {
    filename: string;
    fileSize: number;
    fileFormat: string;
    uploadedAt: Date;
    getSignedUrl(): Promise<string | null>;
};

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: "user" | "moderator" | "admin";
    }
}

export interface CompetitionVoteInterface extends Document {
    user: Types.ObjectId;
    competition: Types.ObjectId;
    submissions: Types.ObjectId[];
};

export interface NotificationInterface extends Document {
    title: string;
    description: string;
    user: Types.ObjectId;
    phase: 'submission' | 'voting' | 'ended';
}

export interface ReportInterface {
    _id: Types.ObjectId;
    reportId: string;
    reportedUserId: Types.ObjectId;
    submissionId: Types.ObjectId;
    competitionId: Types.ObjectId;
    name?: string;
    email: string;
    description: string;
    evidenceImg: string | null;
    createdAt: Date;
    updatedAt: Date;
}