export { rebuildTaste, emptyTaste, topAffinities, signalCount, TRAIN_GOAL } from "./taste.ts";
export { rank, rankShelf, projectMovieState, sessionShownIds, composeQueue, uniqueQueue, RANK_WEIGHTS, ERA_OPTIONS, FEED_WHO, FEED_MOODS, FEED_GENRES, FEED_SERVICES } from "./pipeline.ts";
export type { RankSession, EraFilter } from "./pipeline.ts";
export { minutesUntilBed, clockLine, fitsTonight } from "./clock.ts";
export { collideRank, genreBadges, collideEvents } from "./collide.ts";
export { movieFeatures, scaledMovieFeatures, warmMovieFeatures, cosine, topOverlap } from "./features.ts";
export { tasteGraph, profileSummary } from "./graph.ts";
export {
  parseImportText,
  parseMailLibrary,
  parseLetterboxdRss,
  parsePastedTitles,
  letterboxdUsername,
  type ImportHit,
} from "./import.ts";
export type {
  HouseholdProfile,
  PendingAsk,
  PreferenceAction,
  PreferenceEvent,
  RankedRecommendation,
  TasteProfile,
  UserMovieState,
} from "./types.ts";

import type { HouseholdProfile } from "./types.ts";

export const DEFAULT_PROFILES: HouseholdProfile[] = [
  { id: "you", name: "You", kind: "self" },
  { id: "partner", name: "Partner", kind: "partner" },
  { id: "kids", name: "Kids", kind: "kids" },
];

export const STREAMING_SERVICES = [
  "Netflix",
  "Max",
  "Disney+",
  "Prime Video",
  "Hulu",
  "Apple TV+",
  "Peacock",
  "Paramount+",
] as const;

export const SAMPLE_LIBRARY = `Annihilation
Arrival
Dune: Part Two
Blade Runner 2049
Ex Machina
The Lighthouse
Parasite
There Will Be Blood
Mad Max: Fury Road
Get Out
Her
Whiplash
Spirited Away
Portrait of a Lady on Fire
Moonlight
Paddington 2
The Incredibles
Heat
Drive
The Matrix
`;
