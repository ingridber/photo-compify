import {Document, Types, PopulatedDoc} from "mongoose";
import { Request } from "express";

export type UserRole = | "user" | "moderator" | "admin";

export interface InterfaceUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email?: string;
    username: string;
    password: string;
    profilePicture?: Types.ObjectId | ImageInterface | null;
    role: UserRole;
    warnings: number;
    loginAttempts: number;
    lockUntil: Date | undefined;
    camera?: string | null;
    themes?: string[] | null;
};

export interface CompetitionInterface extends Document {
    _id: Types.ObjectId;
    owner: Types.ObjectId;
    title: string;
    logoBanner?: Types.ObjectId | LogoBanner | null;
    description: string;
    themes: string[];
    startDate: Date;
    votingStartDate: Date;
    endDate: Date;
    submissions: PopulatedDoc<CompetitionSubmissionInterface & Document>[];
    totalVoteCount: number;
    phase: 'submission' | 'voting' | 'ended';
    winners: Types.ObjectId[];
    signedLogoUrl?: string;
};

interface LogoBanner {
    _id: Types.ObjectId;
    getSignedUrl(): Promise<string>;
}

export interface CompetitionSubmissionInterface extends Document {
    _id: Types.ObjectId;
    competition: Types.ObjectId | CompetitionInterface;
    user: Types.ObjectId;
    image: Types.ObjectId;
    description?: string;
    votes: Types.ObjectId[];
};

export interface ImageInterface {
    _id: Types.ObjectId;
    filename: string;
    fileSize: number;
    fileFormat: string;
    uploadedAt: Date;
    uploadedBy?: Types.ObjectId;
    getSignedUrl(): Promise<string | null>;
};

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: "user" | "moderator" | "admin";
    }
}

export interface CompetitionVoteInterface extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    competition: Types.ObjectId;
    submissions: Types.ObjectId[];
};

export interface NotificationInterface extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    user: Types.ObjectId;
    competition?: Types.ObjectId;
    phase: 'submission' | 'voting' | 'ended';
    read: boolean;
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
