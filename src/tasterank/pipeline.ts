import { MOVIES, MOVIE_BY_ID } from "../catalog/movies.ts";
import { filmKey } from "../catalog/title-key.ts";
import { seriesKey } from "../catalog/series.ts";
import type { Movie } from "../catalog/types.ts";
import { consensus } from "../catalog/ratings.ts";
import { cosine, scaledMovieFeatures, scaleFeatures, topOverlap } from "./features.ts";
import { fitsTonight } from "./clock.ts";
import type { PreferenceEvent, RankedRecommendation, TasteProfile, UserMovieState } from "./types.ts";

export type EraFilter = "any" | "5" | "15" | "30" | "classic";

export type RankSession = {
  who?: string;
  mood?: string | null;
  genre?: string | null;
  tonight?: boolean;
  explore?: boolean;
  profileKind?: "self" | "partner" | "kids" | "other";
  englishOnly?: boolean;
  streamingOnly?: boolean;
  preferFresh?: boolean;
  shortOnly?: boolean;
  familySafe?: boolean;
  criticsFirst?: boolean;
  wildcards?: boolean;
  era?: EraFilter;
  subscribed?: string[];
  grokBoost?: Record<string, number>;
  service?: string | null;
  fresh?: boolean;
  minutesLeft?: number;
  room?: string[];
};

export const ERA_OPTIONS: { id: EraFilter; label: string; hint: string }[] = [
  { id: "any", label: "All", hint: "No year cut" },
  { id: "5", label: "Last 5 years", hint: "New releases" },
  { id: "15", label: "Last 15 years", hint: "Still current" },
  { id: "30", label: "Last 30 years", hint: "Modern" },
  { id: "classic", label: "Classics", hint: "Before 1985" },
];

export const FEED_WHO = ["Solo", "Partner", "Family", "Friends"] as const;
export const FEED_MOODS = ["Funny", "Scary", "Intense", "Quiet", "Mind-bending"] as const;
export const FEED_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Drama",
  "Horror",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
] as const;

export const FEED_SERVICES = ["Netflix", "Hulu", "Max", "Disney+", "Prime Video", "Apple TV+", "Peacock", "Paramount+"] as const;

export const RANK_WEIGHTS = [
  { key: "taste", label: "Your taste", pct: "ramps in", detail: "Predicted watch from cosine taste. Soft until ~12 marks, then it runs the feed." },
  { key: "neighbors", label: "Neighbors", pct: "SimClusters", detail: "Same director, cast, and similarIds as films you hearted." },
  { key: "negative", label: "Negatives", pct: "hard", detail: "Not into hides the film and cools its neighbors, like mute on X." },
  { key: "craft", label: "Craft", pct: "light", detail: "RT, Metacritic, IMDb — never louder than you." },
  { key: "fresh", label: "New", pct: "recency", detail: "Recent releases get a half-life boost so 2025–26 can land in the first ten." },
  { key: "session", label: "This sitting", pct: "hard", detail: "Who, mood, genre, streamer, New." },
  { key: "mix", label: "Mixer", pct: "first 10", detail: "Cap genre and director repeats. Interested titles recirculate later — never first. Clock and receipts can still jump." },
  { key: "grok", label: "Grok", pct: "rerank", detail: "Grok reorders the next twenty after a few marks." },
] as const;

export function projectMovieState(events: PreferenceEvent[]): Record<string, UserMovieState> {
  const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId as string));
  const map: Record<string, UserMovieState> = {};
  const seen = new Set<string>();
  for (const e of [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))) {
    if (seen.has(e.id) || reversed.has(e.id) || e.action === "undo") continue;
    seen.add(e.id);
    const s = map[e.entityId] ?? {
      movieId: e.entityId,
      seen: false,
      saved: false,
      favorited: false,
      interested: false,
      notInterested: false,
      skipCount: 0,
      impressionCount: 0,
      neverShowAgain: false,
      owned: false,
    };
    switch (e.action) {
      case "impression":
        s.impressionCount += 1;
        s.lastImpressionAt = e.occurredAt;
        break;
      case "seen":
      case "love":
      case "like":
      case "neutral":
      case "dislike":
      case "import_seen":
        s.seen = true;
        s.neverShowAgain = true;
        if (e.action === "love" || e.action === "like" || e.action === "neutral" || e.action === "dislike") {
          s.sentiment = e.action;
        }
        break;
      case "save":
        s.saved = true;
        break;
      case "import_watchlist":
        s.saved = true;
        s.owned = true;
        break;
      case "unsave":
        s.saved = false;
        break;
      case "favorite":
        s.favorited = true;
        break;
      case "unfavorite":
        s.favorited = false;
        break;
      case "interested":
        s.interested = true;
        s.notInterested = false;
        if (!s.seen) s.neverShowAgain = false;
        break;
      case "uninterested":
        s.interested = false;
        break;
      case "skip":
        s.skipCount += 1;
        s.lastSkippedAt = e.occurredAt;
        break;
      case "not_interested":
        s.notInterested = true;
        s.neverShowAgain = true;
        s.saved = false;
        s.favorited = false;
        s.interested = false;
        break;
      case "show_again":
        s.notInterested = false;
        s.neverShowAgain = s.seen;
        break;
      case "unseen":
        s.seen = false;
        s.sentiment = undefined;
        s.neverShowAgain = s.notInterested;
        break;
      default:
        break;
    }
    map[e.entityId] = s;
  }
  return map;
}

function eraAllows(movie: Movie, era: EraFilter | undefined, now: Date) {
  if (!era || era === "any") return true;
  const year = now.getFullYear();
  if (era === "5") return movie.year >= year - 5;
  if (era === "15") return movie.year >= year - 15;
  if (era === "30") return movie.year >= year - 30;
  return movie.year < 1985;
}

function moodHit(movie: Movie, mood: string) {
  const bag = `${movie.genres.join(" ")} ${movie.tones.join(" ")} ${movie.moods.join(" ")} ${movie.themes.join(" ")}`.toLowerCase();
  if (mood === "Funny") return movie.genres.includes("Comedy") || /comedy|funny|brisk|wit|farce/.test(bag);
  if (mood === "Scary") return movie.genres.includes("Horror") || /horror|dread|uncanny|terror|haunted/.test(bag);
  if (mood === "Intense") return /action|thriller|crime|war|tense|operatic|intense/.test(bag);
  if (mood === "Quiet") return /drama|romance|tender|solemn|cerebral|quiet|melancholy/.test(bag);
  if (mood === "Mind-bending") return /science fiction|mystery|identity|time|language|dream|surreal/.test(bag);
  return true;
}

function eligible(
  movie: Movie,
  state: UserMovieState | undefined,
  now: Date,
  exclude?: Set<string>,
  session?: RankSession,
  trainedOn = 0,
  bannedSeries?: Set<string>,
) {
  if (state?.notInterested || state?.neverShowAgain || state?.seen || state?.favorited) return false;
  if (state?.saved && !state.owned) return false;
  if (exclude?.has(movie.id)) return false;
  if (bannedSeries?.has(seriesKey(movie))) return false;
  if (session?.englishOnly && movie.language !== "en") return false;
  if (session?.profileKind === "kids" && (movie.audience === "adult" || movie.certification === "R")) return false;
  if ((session?.familySafe || session?.who === "Family" || session?.room?.includes("kids")) && (movie.audience === "adult" || movie.certification === "R" || movie.certification === "NC-17")) return false;
  if (session?.who === "Family" && movie.audience !== "kids" && movie.audience !== "family") return false;
  if (session?.shortOnly && movie.runtimeMin > 120) return false;
  if (session?.streamingOnly && session.subscribed?.length) {
    const on = movie.watch.some((w) => w.included && session.subscribed!.includes(w.provider));
    if (!on) return false;
  }
  if (!eraAllows(movie, session?.era, now)) return false;
  if (session?.mood && !moodHit(movie, session.mood)) return false;
  if (session?.genre && !movie.genres.some((g) => g.toLowerCase() === session.genre!.toLowerCase())) return false;
  if (session?.service) {
    const on = movie.watch.some((w) => w.included && w.provider === session.service);
    if (!on) return false;
  }
  if (session?.fresh && movie.year < now.getFullYear() - 1) return false;
  if (!session?.explore && trainedOn < 1 && !session?.genre && !session?.mood && session?.who !== "Family") {
    if (movie.year < 1990 && movie.popularity < 0.62) return false;
    if (movie.popularity < 0.4 && movie.quality < 0.8) return false;
  }
  if (session?.explore && movie.popularity < 0.28 && movie.quality < 0.68) return false;
  if (session?.explore && (state?.interested || state?.favorited || state?.seen)) return false;
  if (state?.lastSkippedAt && !state.interested) {
    const hours = (now.getTime() - new Date(state.lastSkippedAt).getTime()) / 36e5;
    if (hours < 12) return false;
  }
  return true;
}

function sessionBump(movie: Movie, session?: RankSession) {
  let n = 0;
  if (session?.profileKind === "kids") {
    if (movie.audience === "kids") n += 0.22;
    else if (movie.audience === "family") n += 0.14;
  }
  if (session?.who === "Family") {
    if (movie.audience === "kids") n += 0.28;
    else if (movie.audience === "family") n += 0.22;
  } else if (session?.who === "Friends") {
    n += movie.popularity * 0.1;
  } else if (session?.who === "Partner") {
    if (movie.tones.some((t) => /tender|solemn|melancholy|intimate/i.test(t)) || movie.genres.includes("Romance")) n += 0.14;
  }
  if (session?.genre && movie.genres.some((g) => g.toLowerCase() === session.genre!.toLowerCase())) n += 0.34;
  const mood = session?.mood;
  if (!mood) return n;
  if (moodHit(movie, mood)) n += 0.36;
  return n;
}

function genrePull(movie: Movie, taste: Record<string, number>) {
  let pos = 0;
  let neg = 0;
  let hits = 0;
  for (const g of movie.genres) {
    const v = taste[`genre:${g.toLowerCase()}`] ?? 0;
    if (v > 0.25) {
      pos += v;
      hits += 1;
    } else if (v < -0.2) {
      neg += v;
    }
  }
  const director = taste[`director:${movie.director.toLowerCase()}`] ?? 0;
  return { pos, neg, hits, director };
}

function seedMovies(movieState: Record<string, UserMovieState>): Movie[] {
  const ranked = Object.values(movieState)
    .map((s) => {
      let w = 0;
      if (s.favorited) w += 1.1;
      if (s.interested) w += 0.7;
      if (s.sentiment === "love") w += 1;
      else if (s.sentiment === "like") w += 0.6;
      else if (s.seen) w += 0.32;
      if (s.saved) w += 0.22;
      return { id: s.movieId, w };
    })
    .filter((x) => x.w > 0)
    .sort((a, b) => b.w - a.w)
    .slice(0, 12);
  return ranked.map((x) => MOVIE_BY_ID[x.id]).filter((m): m is Movie => Boolean(m));
}

function neighborBoost(movie: Movie, seeds: Movie[]): { score: number; label?: string } {
  let score = 0;
  let label: string | undefined;
  let best = 0;
  const movieCast = new Set(movie.cast.slice(0, 4).map((c) => c.name));
  for (const seed of seeds) {
    if (seed.id === movie.id) continue;
    let n = 0;
    if (seed.similarIds.includes(movie.id) || movie.similarIds.includes(seed.id)) n += 0.24;
    if (seed.director === movie.director) n += 0.14;
    const themes = new Set(seed.themes);
    const shared = movie.themes.filter((t) => themes.has(t)).length;
    if (shared >= 2) n += 0.06;
    else if (shared === 1) n += 0.02;
    const sharedCast = seed.cast.slice(0, 4).filter((c) => movieCast.has(c.name)).length;
    if (sharedCast >= 2) n += 0.1;
    else if (sharedCast === 1) n += 0.03;
    if (n > best) {
      best = n;
      label = seed.title;
    }
    score += n;
  }
  return { score: Math.min(0.42, score), label: best >= 0.08 ? label : undefined };
}

function fatigue(state: UserMovieState | undefined) {
  let n = 0;
  if (state?.skipCount) n -= Math.min(0.28, state.skipCount * 0.08);
  if (state?.impressionCount) n -= Math.min(0.22, Math.max(0, state.impressionCount - 1) * 0.04);
  return n;
}

function statementFor(
  movie: Movie,
  overlaps: ReturnType<typeof topOverlap>,
  neighbor: string | undefined,
  hasTaste: boolean,
  owned?: boolean,
) {
  if (owned) return `You already have this. Put it on tonight.`;
  if (neighbor && overlaps[0]) return `Because you keep ${neighbor} close. Same ${overlaps[0].name.toLowerCase()}.`;
  if (overlaps.length >= 2) return `${movie.director}. You lean ${overlaps[0]!.name.toLowerCase()} and ${overlaps[1]!.name.toLowerCase()}.`;
  if (overlaps[0]) return `You keep marking ${overlaps[0].name.toLowerCase()}. ${movie.director} fits.`;
  if (hasTaste) return `${movie.director}. ${movie.themes.slice(0, 2).join(" · ")}.`;
  return `${movie.year} · ${movie.genres[0]}`;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function predictedWatch(opts: {
  sim: number;
  neighbor: number;
  pull: ReturnType<typeof genrePull>;
  craft: number;
  recency: number;
  subscribed: boolean;
  interested: boolean;
  skipCount: number;
  runtimeMin: number;
}) {
  const pPositive = clamp01(opts.sim * 0.7 + opts.neighbor * 1.05 + opts.pull.director * 0.4 + Math.max(0, opts.pull.pos) * 0.12);
  const pSave = clamp01(opts.sim * 0.42 + opts.craft * 0.22 + (opts.subscribed ? 0.14 : 0) + opts.recency * 0.12);
  const pSkip = clamp01((1 - opts.sim) * 0.42 + (opts.pull.neg < 0 ? 0.28 : 0) + Math.min(0.35, opts.skipCount * 0.12));
  const runtime =
    opts.runtimeMin >= 85 && opts.runtimeMin <= 140 ? 0.08 : opts.runtimeMin > 170 ? -0.1 : 0;
  return 2.0 * pPositive + 1.0 * pSave + 0.45 * opts.craft + (opts.interested ? 0.16 : 0) + runtime - 2.6 * pSkip;
}

function mixWatchable(
  scored: RankedRecommendation[],
  limit: number,
  session?: RankSession,
  now = new Date(),
  movieState?: Record<string, UserMovieState>,
) {
  const pool = scored.slice(0, Math.max(limit * 5, 50));
  const picked: RankedRecommendation[] = [];
  const used = new Set<string>();
  const titles = new Set<string>();
  const genreCount = new Map<string, number>();
  const directors = new Map<string, number>();
  const tight = Boolean(session?.genre || session?.mood || session?.service);
  const take = (list: RankedRecommendation[], ok: (rec: RankedRecommendation) => boolean, cap: number, free = false) => {
    for (const rec of list) {
      if (picked.length >= cap) break;
      if (used.has(rec.movie.id) || titles.has(filmKey(rec.movie.title, rec.movie.year)) || !ok(rec)) continue;
      const g = rec.movie.genres[0] ?? "";
      const d = rec.movie.director;
      if (!free && !tight && picked.length < Math.min(8, limit - 1)) {
        if ((genreCount.get(g) ?? 0) >= 2) continue;
        if (d && (directors.get(d) ?? 0) >= 1) continue;
      }
      picked.push(rec);
      used.add(rec.movie.id);
      titles.add(filmKey(rec.movie.title, rec.movie.year));
      genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
      if (d) directors.set(d, (directors.get(d) ?? 0) + 1);
    }
  };
  take(scored, (r) => Boolean(movieState?.[r.movie.id]?.owned), Math.min(2, limit), true);
  take(pool, (r) => !movieState?.[r.movie.id]?.interested, Math.min(5, limit));
  take(scored, (r) => Boolean(movieState?.[r.movie.id]?.interested), Math.min(picked.length + 2, limit), true);
  if (session?.minutesLeft != null) {
    take(pool, (r) => fitsTonight(r.movie.runtimeMin, session.minutesLeft!), Math.min(6, limit));
  }
  take(pool, () => true, Math.min(3, limit));
  if (session?.subscribed?.length) {
    take(pool, (r) => r.movie.watch.some((w) => w.included && session.subscribed!.includes(w.provider)), Math.min(7, limit));
  }
  if (!session?.fresh && (!session?.era || session.era === "any")) {
    take(pool, (r) => r.movie.year >= now.getFullYear() - 2, Math.min(6, limit));
  }
  take(pool, () => true, limit);
  if (session?.wildcards !== false) {
    const far = pool.slice(Math.floor(pool.length * 0.45));
    for (const rec of far) {
      if (picked.length >= limit) break;
      if (used.has(rec.movie.id) || titles.has(filmKey(rec.movie.title, rec.movie.year))) continue;
      picked.push(rec);
      used.add(rec.movie.id);
      titles.add(filmKey(rec.movie.title, rec.movie.year));
      break;
    }
  }
  return picked;
}

function exploreDiversify(scored: RankedRecommendation[], limit: number) {
  const buckets = new Map<string, RankedRecommendation[]>();
  for (const rec of scored) {
    const g = rec.movie.genres[0] ?? "Other";
    const list = buckets.get(g) ?? [];
    list.push(rec);
    buckets.set(g, list);
  }
  const keys = [...buckets.keys()];
  const out: RankedRecommendation[] = [];
  const used = new Set<string>();
  const titles = new Set<string>();
  const directors = new Set<string>();
  let turn = 0;
  while (out.length < limit && turn < limit * Math.max(keys.length, 1)) {
    const list = buckets.get(keys[turn % keys.length]!);
    const next =
      list?.find((r) => !used.has(r.movie.id) && !titles.has(filmKey(r.movie.title, r.movie.year)) && !directors.has(r.movie.director)) ??
      list?.find((r) => !used.has(r.movie.id) && !titles.has(filmKey(r.movie.title, r.movie.year)));
    if (next) {
      out.push(next);
      used.add(next.movie.id);
      titles.add(filmKey(next.movie.title, next.movie.year));
      directors.add(next.movie.director);
    }
    turn += 1;
    if (turn > 400) break;
  }
  return out;
}

export function rank(opts: {
  taste: TasteProfile;
  movieState: Record<string, UserMovieState>;
  events: PreferenceEvent[];
  now?: Date;
  limit?: number;
  excludeIds?: Set<string>;
  includeIds?: Set<string>;
  subscribed?: string[];
  catalog?: boolean;
  onlyIncluded?: boolean;
  session?: RankSession;
}): { recommendations: RankedRecommendation[] } {
  const now = opts.now ?? new Date();
  const session = opts.session;
  const taste = opts.taste.affinities;
  const trainedOn = opts.taste.trainedOn ?? Object.keys(taste).length;
  const hasTaste = trainedOn >= 1 && Object.keys(taste).length > 2;
  const tasteScaled = scaleFeatures(taste);
  const seeds = seedMovies(opts.movieState);
  const cooled = new Set<string>();
  const bannedSeries = new Set<string>();
  for (const s of Object.values(opts.movieState)) {
    if (!s.notInterested) continue;
    const banned = MOVIE_BY_ID[s.movieId];
    if (!banned) continue;
    bannedSeries.add(seriesKey(banned));
    for (const id of banned.similarIds) {
      const sim = MOVIE_BY_ID[id];
      if (sim && seriesKey(sim) === seriesKey(banned)) continue;
      cooled.add(id);
    }
  }
  const scored: RankedRecommendation[] = [];
  const neighborById = new Map<string, ReturnType<typeof neighborBoost>>();
  const simById = new Map<string, number>();
  const explore = Boolean(session?.explore);

  const pool = opts.onlyIncluded
    ? [...(opts.includeIds ?? [])].map((id) => MOVIE_BY_ID[id]).filter((m): m is Movie => Boolean(m))
    : MOVIES;
  for (const movie of pool) {
    const state = opts.movieState[movie.id];
    if (opts.onlyIncluded) {
      /* score every included title, even parked saves */
    } else if (!opts.catalog && !opts.includeIds?.has(movie.id) && !eligible(movie, state, now, opts.excludeIds, opts.session, trainedOn, bannedSeries)) continue;
    const feats = scaledMovieFeatures(movie);
    const craft = consensus(movie);
    const sim = hasTaste ? cosine(tasteScaled, feats) : 0;
    const neighbor = neighborBoost(movie, seeds);
    const pull = hasTaste ? genrePull(movie, taste) : { pos: 0, neg: 0, hits: 0, director: 0 };
    const age = now.getFullYear() - movie.year;
    const recency = Math.exp(-age / (session?.preferFresh || session?.fresh ? 6 : 14));
    const onSub = Boolean(opts.subscribed?.some((p) => movie.watch.some((w) => w.included && w.provider === p)));
    let score: number;
    if (explore) {
      const novelty = hasTaste ? 1 - Math.max(0, Math.min(1, sim)) : 0.35;
      score = movie.popularity * 0.42 + movie.quality * 0.18 + craft * 0.12 + novelty * 0.28;
    } else if (!hasTaste) {
      score = craft * 0.34 + movie.popularity * 0.26 + recency * 0.2 + movie.quality * 0.2;
      if (age <= 2) score += 0.1;
      if (movie.runtimeMin >= 85 && movie.runtimeMin <= 140) score += 0.05;
    } else {
      const tasteScore = predictedWatch({
        sim,
        neighbor: neighbor.score,
        pull,
        craft,
        recency,
        subscribed: onSub,
        interested: Boolean(state?.interested),
        skipCount: state?.skipCount ?? 0,
        runtimeMin: movie.runtimeMin,
      });
      const cold = craft * 0.3 + movie.popularity * 0.22 + recency * 0.18 + movie.quality * 0.16;
      const confidence = clamp01(trainedOn / 10);
      score = tasteScore * (0.55 + 0.45 * confidence) + cold * (1 - confidence) * 0.4;
      if (pull.hits === 0 && neighbor.score < 0.08) score *= 0.62;
      if (pull.neg) score += Math.max(-1.8, pull.neg * 0.9);
      score += recency * 0.18;
    }
    if (onSub) score += session?.streamingOnly || session?.service ? 0.1 : 0.05;
    if (session?.criticsFirst) score += craft * 0.1;
    score += sessionBump(movie, opts.session);
    score += fatigue(state);
    if (state?.owned) score += 0.55;
    if (session?.minutesLeft != null) {
      if (fitsTonight(movie.runtimeMin, session.minutesLeft)) score += 0.12;
      else score *= 0.52;
    }
    if (cooled.has(movie.id)) score -= 0.48;
    const rt = movie.ratings?.rottenTomatoes;
    if (rt != null) score += (rt / 100 - 0.6) * (session?.criticsFirst ? 0.1 : 0.04);
    if (movie.ratings?.imdb != null) score += (movie.ratings.imdb / 10 - 0.65) * (session?.criticsFirst ? 0.06 : 0.03);
    const grok = session?.grokBoost?.[movie.id];
    if (grok) score += grok;
    simById.set(movie.id, sim);
    neighborById.set(movie.id, neighbor);
    scored.push({
      movie,
      rank: 0,
      score,
      tasteRank: Math.round(Math.max(1, Math.min(99, score * 88 + 10))),
      matchLabel: "Craft",
      statement: "",
      reasons: [],
    });
  }
  scored.sort((a, b) => b.score - a.score);
  const limit = opts.limit ?? 24;
  const top = opts.catalog || opts.onlyIncluded
    ? scored.slice(0, limit)
    : explore
      ? exploreDiversify(scored, limit)
      : mixWatchable(scored, limit, session, now, opts.movieState);

  if (!opts.catalog || top.length <= 48) {
    for (const rec of top) {
      const sim = simById.get(rec.movie.id) ?? 0;
      const neighbor = neighborById.get(rec.movie.id) ?? { score: 0, label: undefined };
      const owned = Boolean(opts.movieState[rec.movie.id]?.owned);
      const overlaps = hasTaste ? topOverlap(taste, rec.movie, 3) : [];
      const reasons = overlaps.map((o) => ({ type: o.kind, label: o.name, contribution: o.value }));
      if (neighbor.label) reasons.push({ type: "neighbor", label: neighbor.label, contribution: neighbor.score });
      const rt = rec.movie.ratings?.rottenTomatoes;
      if (rt != null && rt >= 75) reasons.push({ type: "critics", label: `RT ${Math.round(rt)}%`, contribution: rt / 100 });
      if (!reasons.length) {
        reasons.push({
          type: hasTaste ? "taste" : "quality",
          label: hasTaste ? "Matches how you watch" : explore ? "Teach For you" : "Acclaimed",
          contribution: hasTaste ? sim : rec.movie.quality,
        });
      }
      rec.matchLabel = explore
        ? "Fine tune"
        : owned
          ? "You own this"
          : !hasTaste
            ? "Acclaimed"
            : sim > 0.28 || neighbor.score > 0.1
              ? "For you"
              : sim > 0.14
                ? "Adjacent"
                : "Wildcard";
      rec.statement = explore
        ? "Do you know this one? Mark it so For you can learn."
        : statementFor(rec.movie, overlaps, neighbor.label, hasTaste, owned);
      rec.reasons = reasons.slice(0, 4);
    }
  }

  return { recommendations: uniqueQueue(top).map((r, i) => ({ ...r, rank: i + 1 })) };
}

export function rankShelf(
  movies: Movie[],
  opts: { taste: TasteProfile; movieState: Record<string, UserMovieState> },
): Movie[] {
  if (movies.length <= 1) return movies;
  const recs = rank({
    taste: opts.taste,
    movieState: opts.movieState,
    events: [],
    includeIds: new Set(movies.map((m) => m.id)),
    onlyIncluded: true,
    limit: movies.length,
  }).recommendations;
  const score = new Map(recs.map((r) => [r.movie.id, r.score]));
  return [...movies].sort((a, b) => (score.get(b.id) ?? -1) - (score.get(a.id) ?? -1));
}

export function sessionShownIds(events: PreferenceEvent[], sessionId: string) {
  const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId as string));
  const ids = new Set<string>();
  for (const e of events) {
    if (reversed.has(e.id)) continue;
    if (e.sessionId !== sessionId) continue;
    if (
      e.action === "impression" ||
      e.action === "skip" ||
      e.action === "not_interested" ||
      e.action === "linger" ||
      e.action === "save" ||
      e.action === "favorite" ||
      e.action === "seen"
    ) {
      ids.add(e.entityId);
    }
  }
  return ids;
}

export function uniqueQueue(recs: RankedRecommendation[], blockedTitles?: Set<string>) {
  const ids = new Set<string>();
  const titles = new Set<string>(blockedTitles);
  const out: RankedRecommendation[] = [];
  for (const rec of recs) {
    const title = filmKey(rec.movie.title, rec.movie.year);
    if (ids.has(rec.movie.id) || titles.has(title)) continue;
    ids.add(rec.movie.id);
    titles.add(title);
    out.push(rec);
  }
  return out;
}

export function composeQueue(
  served: RankedRecommendation[],
  ranked: RankedRecommendation[],
  shown: Set<string>,
  keep?: string,
) {
  const blocked = new Set<string>();
  for (const id of shown) {
    if (id === keep) continue;
    const movie = MOVIE_BY_ID[id];
    if (movie) blocked.add(filmKey(movie.title, movie.year));
  }
  const out: RankedRecommendation[] = [];
  const push = (rec: RankedRecommendation | undefined) => {
    if (!rec) return;
    if (shown.has(rec.movie.id) && rec.movie.id !== keep) return;
    const next = uniqueQueue([...out, rec], blocked);
    if (next.length > out.length) out.push(rec);
  };
  for (const rec of served) push(rec);
  if (keep) {
    const kept = ranked.find((r) => r.movie.id === keep) ?? served.find((r) => r.movie.id === keep);
    push(kept);
  }
  for (const rec of ranked) push(rec);
  return uniqueQueue(out, blocked);
}
