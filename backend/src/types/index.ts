import {Document, Types} from "mongoose";
import { Request } from "express";

export interface InterfaceUser extends Document {
    name: string;
    email?: string;
    username: string;
    password: string;
    profilePicture?: Types.ObjectId;
    warnings: number;
    loginAttempts: number;
    lockUntil: Date | undefined;
};

export interface CompetitionInterface extends Document {
    owner: Types.ObjectId;
    title: string;
    logoBanner?: string;
    description: string;
    themes: string[];
    startDate: Date;
    votingStartDate: Date;
    endDate: Date;
    submissions: Types.ObjectId[];
    totalVoteCount: number;
};

export interface CompetitionSubmissionInterface {
    user: string;
    image: string;
    description?: string;
    votes: number;
    uploadedAt: string;
};

// export interface ImageInterface {
//     url: string;
//     uploadedBy: string;
//     uploadedAt: string;
// };

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
