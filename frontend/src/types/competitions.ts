export interface Competition {
  _id: string;
  owner: {
    _id: string;
    username: string;
  };
  title: string;
  logoBanner?: string;
  signedLogoUrl?: string;
  description: string;
  themes: string[];
  startDate: string;
  votingStartDate: string;
  endDate: string;
  submissions: Submission[];
  totalVoteCount: number;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
}

export interface Submission {
  _id: string;
  competition: 
    | string 
    | {_id: string; title?: string};
  user: 
    | string 
    | {_id: string; username: string;};
  image: 
    | string 
    | {_id?: string; filename?: string};
  imageUrl?: string;
  signedImageUrl?: string;
  description?: string;
  votes: string[];
  createdAt: string;
  updatedAt: string;
  indicator? : | "voted" | "gold" | "silver" | "bronze" | "none";
}

export type Phase = "submission" | "voting" | "finished";

export type Indicator = "voted" | "gold" | "silver" | "bronze" | "none";

export type ThemeOption = {
  value: string;
  label: string;
};

