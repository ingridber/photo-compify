export interface InterfaceUser {
    name: string;
    email?: string;
    username: string;
    password: string;
    profilePicture: ImageInterface;
    warnings: number;
};

export interface CompetitionInterface {
    owner: string;
    title: string;
    logoBanner?: string;
    description: string;
    themes: string[];
    submissionTimeLimit: number;
    votingTimeLimit: number;
    startDate: string;
    endDate: string;
    phase: "submission" | "voting" | "ended";
    participantCount: number;
    submissions: CompetitionSubmissionInterface[];
    totalVoteCount: number;
};

export interface CompetitionSubmissionInterface {
    user: string;
    image: string;
    description?: string;
    votes: number;
    uploadedAt: string;
};

export interface ImageInterface {
    url: string;
    uploadedBy: string;
    uploadedAt: string;
};
