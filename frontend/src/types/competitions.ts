export interface Competition {
  _id: string;
  owner: {
    _id: string;
    username: string;
  };
  title: string;
  logoBanner?: string;
  description: string;
  themes: string[];
  startDate: string;
  votingStartDate: string;
  endDate: string;
  submissions: Submission[];
  totalVoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  competition: string;
  user: {
    _id: string;
    username: string;
  };
  image: string;
  signedImageUrl?: string;
  description?: string;
  votes: string[];
  createdAt: string;
  updatedAt: string;
}

export type Phase = "submission" | "voting" | "finished";

export type Indicator = "voted" | "gold" | "silver" | "bronze" | "none";
