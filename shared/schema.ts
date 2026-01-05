import { z } from "zod";

export const citationSchema = z.object({
  number: z.number(),
  url: z.string(),
  title: z.string().optional(),
  source: z.string().optional(),
});

export type Citation = z.infer<typeof citationSchema>;

export const matchupSchema = z.object({
  team1: z.string(),
  team2: z.string(),
  seed1: z.number().optional(),
  seed2: z.number().optional(),
  winner: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

export type Matchup = z.infer<typeof matchupSchema>;

export const roundSchema = z.object({
  roundName: z.string(),
  matchups: z.array(matchupSchema),
});

export type Round = z.infer<typeof roundSchema>;

export const bracketSchema = z.object({
  tournament: z.string(),
  sport: z.string(),
  rounds: z.array(roundSchema),
});

export type Bracket = z.infer<typeof bracketSchema>;

export const predictionSchema = z.object({
  id: z.string(),
  round: z.string(),
  team1: z.string(),
  team2: z.string(),
  winner: z.string(),
  research: z.string(),
  citations: z.array(citationSchema),
  timestamp: z.string(),
});

export type Prediction = z.infer<typeof predictionSchema>;

export const tournamentRequestSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  tournament: z.string().min(1, "Tournament name is required"),
});

export type TournamentRequest = z.infer<typeof tournamentRequestSchema>;

export const matchupRequestSchema = z.object({
  team1: z.string().min(1, "Team 1 is required"),
  team2: z.string().min(1, "Team 2 is required"),
  sport: z.string().optional(),
  tournament: z.string().optional(),
});

export type MatchupRequest = z.infer<typeof matchupRequestSchema>;

export const bracketResponseSchema = z.object({
  research: z.string(),
  bracket: bracketSchema,
});

export type BracketResponse = z.infer<typeof bracketResponseSchema>;

export const recommendationSchema = z.object({
  winner: z.string(),
  confidence: z.number().min(0).max(100),
  rationale: z.string(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

export const matchupResponseSchema = z.object({
  research: z.string(),
  citations: z.array(citationSchema),
  recommendation: recommendationSchema.optional(),
});

export type MatchupResponse = z.infer<typeof matchupResponseSchema>;

export interface AppState {
  sport: string;
  tournament: string;
  bracket: Bracket | null;
  currentRound: number;
  currentMatchupIndex: number;
  research: string;
  citations: Citation[];
  recommendation: Recommendation | null;
  predictions: Prediction[];
  loading: boolean;
  researchLoading: boolean;
}
