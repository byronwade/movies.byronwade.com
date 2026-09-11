import { MOVIE_BY_ID } from "../catalog/movies.ts";
import { movieFeatures } from "./features.ts";
import type { PreferenceEvent, TasteProfile } from "./types.ts";

export const TRAIN_GOAL = 30;

const WEIGHT: Partial<Record<PreferenceEvent["action"], number>> = {
  love: 1,
  favorite: 1.05,
  interested: 0.78,
  like: 0.7,
  seen: 0.5,
  import_seen: 0.48,
  save: 0.4,
  linger: 0.18,
  trailer_started: 0.1,
  details_opened: 0.07,
  search: 0.08,
  import_watchlist: 0.18,
  skip: -0.48,
  not_interested: -1,
  dislike: -0.75,
};

const POSITIVE_HALF_LIFE = 160;
const NEGATIVE_HALF_LIFE = 80;

export function emptyTaste(): TasteProfile {
  return { version: "2.0.0", affinities: {}, trainedOn: 0 };
}

function recency(occurredAt: string, now: Date, negative: boolean) {
  const days = Math.max(0, (now.getTime() - new Date(occurredAt).getTime()) / 864e5);
  const half = negative ? NEGATIVE_HALF_LIFE : POSITIVE_HALF_LIFE;
  const floor = negative ? 0.28 : 0.42;
  return Math.max(floor, Math.pow(0.5, days / half));
}

export function signalCount(events: PreferenceEvent[]): number {
  const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId as string));
  const ids = new Set<string>();
  for (const event of events) {
    if (reversed.has(event.id) || event.action === "undo") continue;
    if (WEIGHT[event.action] == null) continue;
    ids.add(event.entityId);
  }
  return ids.size;
}

export function rebuildTaste(events: PreferenceEvent[], now = new Date()): TasteProfile {
  const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId as string));
  const net: Record<string, number> = {};
  for (const event of events) {
    if (reversed.has(event.id) || event.action === "undo") continue;
    const w = WEIGHT[event.action];
    if (!w) continue;
    const strength = event.strength ?? 1;
    net[event.entityId] = (net[event.entityId] ?? 0) + w * recency(event.occurredAt, now, w < 0) * strength;
  }

  const aff: Record<string, number> = {};
  let trainedOn = 0;
  for (const [id, raw] of Object.entries(net)) {
    const weight = Math.max(-1.3, Math.min(1.65, raw));
    if (Math.abs(weight) < 0.02) continue;
    const movie = MOVIE_BY_ID[id];
    if (!movie) continue;
    if (Math.abs(weight) > 0.12) trainedOn += 1;
    const features = movieFeatures(movie);
    for (const [k, v] of Object.entries(features)) {
      aff[k] = (aff[k] ?? 0) + weight * v;
    }
  }
  return { version: "2.0.0", affinities: aff, trainedOn };
}

export function topAffinities(taste: TasteProfile, prefix: string, n = 6) {
  return Object.entries(taste.affinities)
    .filter(([k, v]) => k.startsWith(prefix) && v > 0.15)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({
      key,
      name: key.slice(prefix.length).replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
    }));
}
