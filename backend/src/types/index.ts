import {Document, Types} from "mongoose";
import { Request } from "express";

export interface InterfaceUser extends Document {
    name: string;
    email?: string;
    username: string;
    password: string;
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
    competition: Types.ObjectId;
    user: Types.ObjectId;
    image: Types.ObjectId;
    description?: string;
    votes: Types.ObjectId[];
};

export interface ImageInterface {
    filename: string;
    fileSize: number;
    fileFormat: string;
    uploadedAt: Date;
    getSignedUrl(): Promise<string | null>;
};

export interface AuthRequest extends Request {
    user?: {
        id: string
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
    id: string;
    submissionId: string;
    competitionId: string;
    userId: string;
    name?: string;
    email: string;
    description: string;
    evidenceImageId?: string | null;
    createdAt: Date;
}