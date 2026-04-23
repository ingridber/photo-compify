import {Document, Types} from "mongoose";

export interface InterfaceUser extends Document {
    name: string;
    email?: string;
    username: string;
    password: string;
    profilePicture?: string;
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
    url: string;
    uploadedBy: string;
    filename: string;
    fileSize: number;
    fileFormat: string;
    uploadedAt: Date;
};
