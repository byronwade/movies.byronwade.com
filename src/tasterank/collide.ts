import { MOVIE_BY_ID } from "../catalog/movies.ts";
import type { Movie } from "../catalog/types.ts";
import { projectMovieState, rank } from "./pipeline.ts";
import { rebuildTaste } from "./taste.ts";
import type { PreferenceEvent } from "./types.ts";

export type PublicTasteShelf = {
  handle: string;
  name: string;
  favorites?: string[];
  saved?: string[];
  interested?: string[];
  seen?: string[];
  passed?: string[];
};

function synth(
  ids: string[] | undefined,
  action: PreferenceEvent["action"],
  profileId: string,
): PreferenceEvent[] {
  return (ids ?? []).map((id) => ({
    id: `c_${profileId}_${action}_${id}`,
    userId: profileId,
    profileId,
    entityType: "movie" as const,
    entityId: id,
    action,
    source: "collide",
    sessionId: "collide",
    occurredAt: "2026-01-01T00:00:00.000Z",
  }));
}

export function collideEvents(a: PublicTasteShelf, b: PublicTasteShelf): PreferenceEvent[] {
  return [
    ...synth(a.favorites, "favorite", "a"),
    ...synth(b.favorites, "favorite", "b"),
    ...synth(a.interested, "interested", "a"),
    ...synth(b.interested, "interested", "b"),
    ...synth(a.saved, "import_watchlist", "a"),
    ...synth(b.saved, "import_watchlist", "b"),
    ...synth(a.seen, "seen", "a"),
    ...synth(b.seen, "seen", "b"),
    ...synth(a.passed, "not_interested", "a"),
    ...synth(b.passed, "not_interested", "b"),
  ];
}

export function collideRank(a: PublicTasteShelf, b: PublicTasteShelf, now = new Date()) {
  const events = collideEvents(a, b);
  const movieState = projectMovieState(events);
  const taste = rebuildTaste(events, now);
  return rank({
    taste,
    movieState,
    events,
    now,
    limit: 12,
    session: { englishOnly: true, tonight: true, who: "Friends" },
  }).recommendations;
}

export function shelfMovies(ids: string[] | undefined): Movie[] {
  return (ids ?? []).map((id) => MOVIE_BY_ID[id]).filter((m): m is Movie => Boolean(m));
}

export function genreBadges(ids: string[] | undefined, n = 3) {
  const counts = new Map<string, number>();
  for (const movie of shelfMovies(ids)) {
    for (const g of movie.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name);
}
