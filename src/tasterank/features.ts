import type { Movie } from "../catalog/types.ts";
import { MOVIES } from "../catalog/movies.ts";
import { ratingFeatures } from "../catalog/ratings.ts";

const featureCache = new Map<string, Record<string, number>>();

export function movieFeatures(movie: Movie): Record<string, number> {
  const hit = featureCache.get(movie.id);
  if (hit) return hit;
  const f: Record<string, number> = {
    [`year:${Math.floor(movie.year / 10) * 10}`]: 0.35,
    [`cert:${movie.certification}`]: 0.15,
    [`audience:${movie.audience}`]: 0.45,
    [`lang:${movie.language}`]: 0.2,
  };
  if (movie.director) f[`director:${movie.director.toLowerCase()}`] = 1;
  for (const g of movie.genres ?? []) f[`genre:${g.toLowerCase()}`] = 0.9;
  for (const t of movie.themes ?? []) f[`theme:${t.toLowerCase()}`] = 0.95;
  for (const t of movie.tones ?? []) f[`tone:${t.toLowerCase()}`] = 0.85;
  for (const m of movie.moods ?? []) f[`mood:${m.toLowerCase()}`] = 0.7;
  for (const w of movie.writers ?? []) f[`writer:${w.toLowerCase()}`] = 0.55;
  for (const c of (movie.cast ?? []).slice(0, 4)) f[`actor:${c.name.toLowerCase()}`] = 0.5;
  Object.assign(f, ratingFeatures(movie.ratings));
  featureCache.set(movie.id, f);
  return f;
}

let dfCache: { n: number; df: Record<string, number> } | null = null;

function corpus() {
  if (dfCache) return dfCache;
  const df: Record<string, number> = {};
  for (const movie of MOVIES) {
    for (const key of Object.keys(movieFeatures(movie))) df[key] = (df[key] ?? 0) + 1;
  }
  dfCache = { n: MOVIES.length, df };
  return dfCache;
}

export function idf(key: string) {
  const { n, df } = corpus();
  return Math.log(1 + n / (df[key] ?? 1));
}

export function scaleFeatures(features: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(features)) out[k] = v * idf(k);
  return out;
}

const scaledCache = new Map<string, Record<string, number>>();

export function scaledMovieFeatures(movie: Movie): Record<string, number> {
  const hit = scaledCache.get(movie.id);
  if (hit) return hit;
  const scaled = scaleFeatures(movieFeatures(movie));
  scaledCache.set(movie.id, scaled);
  return scaled;
}

export function warmMovieFeatures() {
  corpus();
  for (const movie of MOVIES.slice(0, 80)) scaledMovieFeatures(movie);
}

export function cosine(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of Object.values(a)) na += v * v;
  for (const v of Object.values(b)) nb += v * v;
  if (!na || !nb) return 0;
  const smaller = Object.keys(a).length <= Object.keys(b).length ? a : b;
  const other = smaller === a ? b : a;
  for (const [k, v] of Object.entries(smaller)) {
    const o = other[k];
    if (o) dot += v * o;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function prettyFeature(key: string) {
  return (key.split(":")[1] ?? key).replace(/\b\w/g, (c) => c.toUpperCase());
}

export function topOverlap(taste: Record<string, number>, movie: Movie, n = 3) {
  const features = movieFeatures(movie);
  const hits: { key: string; name: string; kind: string; value: number }[] = [];
  for (const [k, v] of Object.entries(features)) {
    const t = taste[k];
    if (!t || t <= 0.12) continue;
    hits.push({
      key: k,
      name: prettyFeature(k),
      kind: k.split(":")[0] ?? "taste",
      value: t * v,
    });
  }
  hits.sort((a, b) => b.value - a.value);
  const seen = new Set<string>();
  const out = [];
  for (const h of hits) {
    if (seen.has(h.kind) && (h.kind === "year" || h.kind === "cert" || h.kind === "lang" || h.kind === "audience")) continue;
    seen.add(h.key);
    out.push(h);
    if (out.length >= n) break;
  }
  return out;
}

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
