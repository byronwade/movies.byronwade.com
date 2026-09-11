import type { Movie, MovieRatings } from "./types.ts";

const craftCache = new Map<string, number>();

export function consensus(movie: Movie): number {
  const hit = craftCache.get(movie.id);
  if (hit != null) return hit;
  const r = movie.ratings;
  if (!r) {
    craftCache.set(movie.id, movie.quality);
    return movie.quality;
  }
  const parts: number[] = [];
  if (r.rottenTomatoes != null) parts.push(r.rottenTomatoes / 100);
  if (r.metacritic != null) parts.push(r.metacritic / 100);
  if (r.imdb != null) parts.push(r.imdb / 10);
  if (r.audience != null) parts.push(r.audience / 100);
  if (!parts.length) {
    craftCache.set(movie.id, movie.quality);
    return movie.quality;
  }
  const critics = parts.reduce((a, b) => a + b, 0) / parts.length;
  const value = Math.max(0, Math.min(1, movie.quality * 0.38 + critics * 0.62));
  craftCache.set(movie.id, value);
  return value;
}

export function ratingsLine(ratings: MovieRatings | undefined, wide = false): string | null {
  if (!ratings) return null;
  const bits: string[] = [];
  if (ratings.rottenTomatoes != null) bits.push(`RT ${Math.round(ratings.rottenTomatoes)}%`);
  if (wide && ratings.audience != null) bits.push(`Audience ${Math.round(ratings.audience)}%`);
  if (ratings.imdb != null) bits.push(`IMDb ${ratings.imdb.toFixed(1)}`);
  if (wide && ratings.metacritic != null) bits.push(`${Math.round(ratings.metacritic)} Metacritic`);
  return bits.length ? bits.join(" · ") : null;
}

export function ratingFeatures(ratings: MovieRatings | undefined): Record<string, number> {
  const f: Record<string, number> = {};
  if (!ratings) return f;
  const rt = ratings.rottenTomatoes;
  if (rt != null) {
    if (rt >= 90) f["rt:certified"] = 0.95;
    else if (rt >= 60) f["rt:fresh"] = 0.8;
    else f["rt:rotten"] = 0.85;
  }
  const aud = ratings.audience;
  if (aud != null) {
    if (aud >= 80) f["audience:loved"] = 0.7;
    else if (aud < 55) f["audience:split"] = 0.55;
  }
  if (rt != null && aud != null && aud - rt >= 15) f["split:audience"] = 0.5;
  if (rt != null && aud != null && rt - aud >= 20) f["split:critics"] = 0.5;
  const imdb = ratings.imdb;
  if (imdb != null) {
    if (imdb >= 8) f["imdb:high"] = 0.7;
    else if (imdb >= 7) f["imdb:good"] = 0.5;
    else f["imdb:mixed"] = 0.45;
  }
  if (ratings.metacritic != null && ratings.metacritic >= 80) f["meta:acclaim"] = 0.65;
  return f;
}
