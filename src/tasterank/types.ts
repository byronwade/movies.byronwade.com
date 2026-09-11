import type { Movie } from "@/catalog/types";

export type PreferenceAction =
  | "impression"
  | "seen"
  | "love"
  | "like"
  | "neutral"
  | "dislike"
  | "save"
  | "unsave"
  | "favorite"
  | "unfavorite"
  | "interested"
  | "uninterested"
  | "skip"
  | "not_interested"
  | "show_again"
  | "unseen"
  | "undo"
  | "trailer_started"
  | "details_opened"
  | "search"
  | "linger"
  | "import_seen"
  | "import_watchlist";

export type PreferenceEvent = {
  id: string;
  userId: string;
  profileId: string;
  entityType: "movie";
  entityId: string;
  action: PreferenceAction;
  source: string;
  strength?: number;
  sessionId: string;
  occurredAt: string;
  reversesId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type UserMovieState = {
  movieId: string;
  seen: boolean;
  saved: boolean;
  favorited: boolean;
  interested: boolean;
  notInterested: boolean;
  skipCount: number;
  impressionCount: number;
  lastSkippedAt?: string;
  lastImpressionAt?: string;
  neverShowAgain: boolean;
  owned?: boolean;
  sentiment?: "love" | "like" | "neutral" | "dislike";
};

export type TasteProfile = {
  version: string;
  affinities: Record<string, number>;
  trainedOn: number;
};

export type RankedRecommendation = {
  movie: Movie;
  rank: number;
  score: number;
  tasteRank: number;
  matchLabel: string;
  statement: string;
  reasons: { type: string; label: string; contribution: number }[];
};

export type HouseholdProfile = {
  id: string;
  name: string;
  kind: "self" | "partner" | "kids" | "other";
};

export type PendingAsk = {
  movieId: string;
  title: string;
  source: string;
};

export type TasteNode = {
  key: string;
  name: string;
  value: number;
  kind: "genre" | "theme" | "tone" | "mood" | "person" | "era" | "craft" | "negative";
  children?: TasteNode[];
};
