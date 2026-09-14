import { create } from "zustand";
import { MOVIE_BY_ID } from "@/catalog/movies";
import type { Movie } from "@/catalog/types";
import {
  DEFAULT_PROFILES,
  composeQueue,
  emptyTaste,
  parseImportText,
  projectMovieState,
  rank,
  rankShelf,
  rebuildTaste,
  sessionShownIds,
  signalCount,
  minutesUntilBed,
  warmMovieFeatures,
  type HouseholdProfile,
  type ImportHit,
  type PendingAsk,
  type PreferenceAction,
  type PreferenceEvent,
  type RankedRecommendation,
  type TasteProfile,
  type UserMovieState,
} from "@/tasterank";
import { eventId, markEventId, sessionId } from "./ids";
import { pullKinoState, pushKinoEvents, pushKinoState } from "./server/sync";
import { importLibrary } from "./server/import";
import { pullMailLibrary, probeGmail } from "./server/ambient";
import { grokRerank } from "./server/grok-taste";

const LAST_USER = "kino.lastUserId";
const STORE_VERSION = "v4";
const PREFS_VERSION = 7;

function key(userId: string) {
  return `kino.${STORE_VERSION}.${userId}`;
}

function legacyKeys(userId: string) {
  return [`kino.v3.${userId}`, `kino.v2.${userId}`];
}

type Persist = {
  prefsVersion: number;
  events: PreferenceEvent[];
  marks?: Record<string, Record<string, MarkSnap>>;
  services: string[];
  profiles: HouseholdProfile[];
  activeProfileId: string;
  pendingAsks: PendingAsk[];
  englishOnly: boolean;
  spoilerSafe: boolean;
  tonight: TonightSession | null;
  letterboxdUser: string;
  gmail: GmailLink;
  tune: FeedTune;
  handle: string;
  handlePublic: boolean;
};

export type TonightSession = {
  who: string;
  mood: string | null;
  genre: string | null;
  service: string | null;
  fresh: boolean;
  room?: string[];
};

export type FeedTune = {
  streamingOnly: boolean;
  preferFresh: boolean;
  shortOnly: boolean;
  familySafe: boolean;
  criticsFirst: boolean;
  wildcards: boolean;
  era: "any" | "5" | "15" | "30" | "classic";
};

export const DEFAULT_TUNE: FeedTune = {
  streamingOnly: false,
  preferFresh: false,
  shortOnly: false,
  familySafe: false,
  criticsFirst: false,
  wildcards: true,
  era: "any",
};

function parseTonight(raw: unknown): TonightSession | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Partial<TonightSession>;
  if (typeof t.who !== "string") return null;
  return {
    who: t.who,
    mood: typeof t.mood === "string" ? t.mood : null,
    genre: typeof t.genre === "string" ? t.genre : null,
    service: typeof t.service === "string" ? t.service : null,
    fresh: Boolean(t.fresh),
    room: Array.isArray(t.room) ? t.room.filter((id): id is string => typeof id === "string") : undefined,
  };
}

function parseTune(raw: unknown): FeedTune {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_TUNE };
  const t = raw as Partial<FeedTune>;
  const era = t.era;
  return {
    streamingOnly: Boolean(t.streamingOnly),
    preferFresh: Boolean(t.preferFresh),
    shortOnly: Boolean(t.shortOnly),
    familySafe: Boolean(t.familySafe),
    criticsFirst: Boolean(t.criticsFirst),
    wildcards: t.wildcards !== false,
    era: era === "5" || era === "15" || era === "30" || era === "classic" ? era : "any",
  };
}

export type NoticeKind = "ok" | "err" | "warn" | "info";

export type Notice = {
  id: string;
  kind: NoticeKind;
  title: string;
  body?: string;
};

export type GrokLink = "unknown" | "checking" | "connected" | "needs_login" | "error" | "disconnected";
export type ScanLink = "idle" | "scanning" | "ok" | "empty" | "error";

export type GmailLink = {
  grok: GrokLink;
  scan: ScanLink;
  count: number;
  total: number;
  message: string;
  at?: string;
};

const EMPTY_GMAIL: GmailLink = {
  grok: "unknown",
  scan: "idle",
  count: 0,
  total: 0,
  message: "Not checked yet.",
};

function parseGmail(raw: unknown): GmailLink {
  if (!raw || typeof raw !== "object") return { ...EMPTY_GMAIL };
  const g = raw as Partial<GmailLink>;
  const grok = g.grok === "checking" ? "unknown" : g.grok;
  const total = typeof g.total === "number" ? g.total : typeof g.count === "number" ? g.count : 0;
  return {
    grok:
      grok === "connected" || grok === "needs_login" || grok === "error" || grok === "disconnected"
        ? grok
        : "unknown",
    scan: g.scan === "ok" || g.scan === "empty" || g.scan === "error" ? g.scan : "idle",
    count: typeof g.count === "number" ? g.count : 0,
    total,
    message: typeof g.message === "string" && g.message ? g.message : EMPTY_GMAIL.message,
    at: typeof g.at === "string" ? g.at : undefined,
  };
}

type KinoState = {
  ready: boolean;
  userId: string;
  signedIn: boolean;
  events: PreferenceEvent[];
  movieState: Record<string, UserMovieState>;
  taste: TasteProfile;
  services: string[];
  profiles: HouseholdProfile[];
  activeProfileId: string;
  pendingAsks: PendingAsk[];
  englishOnly: boolean;
  spoilerSafe: boolean;
  tonight: TonightSession | null;
  letterboxdUser: string;
  gmail: GmailLink;
  tune: FeedTune;
  handle: string;
  handlePublic: boolean;
  feedMode: "for-you" | "tune";
  grokNote: string;
  grokBoost: Record<string, number>;
  queue: RankedRecommendation[];
  ranks: Record<string, RankedRecommendation>;
  index: number;
  sessionKey: string;
  undo: { eventId: string; label: string } | null;
  trailerFor: string | null;
  trailerClip: string | null;
  scanning: boolean;
  importing: boolean;
  notice: Notice | null;
  hydrate: (opts: { userId: string; signedIn: boolean }) => Promise<void>;
  rebuildQueue: (keep?: string | null, light?: boolean) => void;
  record: (
    action: PreferenceAction,
    movieId: string,
    extra?: { source?: string; label?: string; reversesId?: string; profileId?: string; strength?: number },
  ) => void;
  undoLast: () => void;
  setIndex: (i: number) => void;
  setServices: (s: string[]) => void;
  setEnglishOnly: (v: boolean) => void;
  setSpoilerSafe: (v: boolean) => void;
  setTune: (patch: Partial<FeedTune>) => void;
  setLetterboxdUser: (v: string) => void;
  setActiveProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setTonight: (t: TonightSession | null) => void;
  setFeedMode: (mode: "for-you" | "tune") => void;
  refreshGrok: () => Promise<void>;
  answerAsk: (movieId: string, profileId: string | "skip") => void;
  deferAsk: () => void;
  ingestHits: (hits: ImportHit[], askHousehold: boolean) => number;
  importText: (input: { text?: string; username?: string }) => Promise<{ ok: boolean; count: number; error?: string }>;
  scanMail: () => Promise<{ ok: boolean; count: number; loginRequired?: boolean; loginUrl?: string; error?: string }>;
  checkGrok: () => Promise<{ connected: boolean; loginRequired?: boolean; loginUrl?: string }>;
  markGrokConnected: () => void;
  disconnectGrok: () => void;
  forgetMailImports: () => number;
  disconnectLetterboxd: () => number;
  claimHandle: (handle: string) => Promise<{ ok: boolean; error?: string }>;
  setHandlePublic: (v: boolean) => void;
  flash: (notice: Omit<Notice, "id">) => void;
  clearNotice: () => void;
  openTrailer: (id: string | null, clip?: string) => void;
  flushSync: () => void;
};

function withTimeout<T>(p: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function eventsFor(state: KinoState) {
  const room = state.tonight?.room;
  if (room?.length) {
    return state.events.filter((e) => room.includes(e.profileId) || e.profileId === "everyone");
  }
  const pid = state.activeProfileId;
  return state.events.filter((e) => e.profileId === pid || e.profileId === "everyone");
}

let remoteTimer = 0;
let remotePayload: Persist | null = null;
const syncedByUser = new Map<string, Set<string>>();
let syncing = false;
let syncFails = 0;

function syncedSet(userId: string) {
  let set = syncedByUser.get(userId);
  if (!set) {
    set = new Set();
    syncedByUser.set(userId, set);
  }
  return set;
}

function persist(state: KinoState, flush = false) {
  const events = compactEvents(state.events);
  const marks = snapBook(events);
  const data: Persist = {
    prefsVersion: PREFS_VERSION,
    events,
    marks,
    services: state.services,
    profiles: state.profiles,
    activeProfileId: state.activeProfileId,
    pendingAsks: state.pendingAsks,
    englishOnly: state.englishOnly,
    spoilerSafe: state.spoilerSafe,
    tonight: state.tonight,
    letterboxdUser: state.letterboxdUser,
    gmail: { ...state.gmail, message: state.gmail.message.slice(0, 1800) },
    tune: state.tune,
    handle: state.handle,
    handlePublic: state.handlePublic,
  };
  remotePayload = data;
  const write = (k: string, value: string) => {
    try {
      localStorage.setItem(k, value);
      return true;
    } catch {
      return false;
    }
  };
  const packed = JSON.stringify(data);
  if (!write(key(state.userId), packed)) {
    write(key(state.userId), JSON.stringify({ ...data, events: events.filter((e) => e.action !== "impression" && e.action !== "linger") }));
  }
  write(markKey(state.userId), JSON.stringify(marks));
  if (state.signedIn && state.userId !== "guest") write(LAST_USER, state.userId);
  if (!state.signedIn || state.userId === "guest") return;
  const send = () => {
    void pushRemote(useKino.getState());
  };
  if (flush || typeof window === "undefined") {
    if (typeof window !== "undefined") window.clearTimeout(remoteTimer);
    send();
    return;
  }
  window.clearTimeout(remoteTimer);
  remoteTimer = window.setTimeout(send, 200);
}

async function pushRemote(state: KinoState) {
  if (syncing || !state.signedIn || state.userId === "guest") return;
  syncing = true;
  let last: Persist | null = null;
  try {
    while (remotePayload) {
      last = remotePayload;
      remotePayload = null;
      const unsynced = last.events.filter((e) => !syncedSet(state.userId).has(e.id)).slice(-400);
      if (unsynced.length) {
        const result = (await pushKinoEvents({ data: { events: unsynced } })) as { ok?: boolean; error?: string };
        if (result && result.ok === false) throw new Error(result.error ?? "events");
        const synced = syncedSet(state.userId);
        for (const e of unsynced) synced.add(e.id);
      }
      const { prefsVersion: _v, ...prefs } = last;
      const prefsResult = (await pushKinoState({ data: { payload: { ...prefs, events: unsynced } } })) as {
        ok?: boolean;
        error?: string;
      };
      if (prefsResult && prefsResult.ok === false) throw new Error(prefsResult.error ?? "prefs");
    }
    syncFails = 0;
  } catch {
    if (last && !remotePayload) remotePayload = last;
    syncFails += 1;
    if (syncFails === 3) {
      useKino.getState().flash({
        kind: "err",
        title: "Couldn’t reach your account",
        body: "Marks are on this device. We’ll keep trying.",
      });
    }
    window.setTimeout(() => {
      const current = useKino.getState();
      if (current.signedIn) void pushRemote(current);
    }, Math.min(12_000, 1500 * 2 ** Math.min(syncFails, 3)));
  } finally {
    syncing = false;
  }
  if (remotePayload) void pushRemote(useKino.getState());
}

function parsePersist(raw: string, _migrate: boolean): Persist | null {
  try {
    const p = JSON.parse(raw) as Partial<Persist> & { spoilerSafe?: boolean; prefsVersion?: number };
    if (!p || typeof p !== "object") return null;
    return {
      prefsVersion: PREFS_VERSION,
      events: Array.isArray(p.events) ? p.events : [],
      marks: parseMarks(p.marks),
      services: Array.isArray(p.services) ? p.services : [],
      profiles: Array.isArray(p.profiles) && p.profiles.length ? p.profiles : DEFAULT_PROFILES,
      activeProfileId: typeof p.activeProfileId === "string" ? p.activeProfileId : "you",
      pendingAsks: Array.isArray(p.pendingAsks) ? p.pendingAsks : [],
      englishOnly: typeof p.englishOnly === "boolean" ? p.englishOnly : true,
      spoilerSafe: typeof p.spoilerSafe === "boolean" ? p.spoilerSafe : true,
      tonight: parseTonight(p.tonight),
      letterboxdUser: typeof p.letterboxdUser === "string" ? p.letterboxdUser : "",
      gmail: parseGmail(p.gmail),
      tune: parseTune((p as Persist).tune),
      handle: typeof (p as Persist).handle === "string" ? (p as Persist).handle : "",
      handlePublic: (p as Persist).handlePublic !== false,
    };
  } catch {
    return null;
  }
}

function isMarkSnap(v: unknown): v is MarkSnap {
  return Boolean(v && typeof v === "object" && ("saved" in v || "favorited" in v || "interested" in v || "seen" in v || "notInterested" in v));
}

function parseMarks(raw: Persist["marks"]): Record<string, Record<string, MarkSnap>> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const first = Object.values(raw)[0];
  if (isMarkSnap(first)) return { you: raw as Record<string, MarkSnap> };
  const book: Record<string, Record<string, MarkSnap>> = {};
  for (const [pid, marks] of Object.entries(raw as Record<string, unknown>)) {
    if (!marks || typeof marks !== "object") continue;
    book[pid] = marks as Record<string, MarkSnap>;
  }
  return Object.keys(book).length ? book : undefined;
}

function loadMarks(userId: string): Record<string, Record<string, MarkSnap>> {
  try {
    const raw = localStorage.getItem(markKey(userId));
    if (!raw) return {};
    return parseMarks(JSON.parse(raw) as Persist["marks"]) ?? {};
  } catch {
    return {};
  }
}

function loadLocal(userId: string): Persist | null {
  try {
    const current = localStorage.getItem(key(userId));
    const parsed = current ? parsePersist(current, false) : null;
    const fallback = parsed
      ? parsed
      : legacyKeys(userId).reduce<Persist | null>((found, legacy) => {
          if (found) return found;
          const raw = localStorage.getItem(legacy);
          return raw ? parsePersist(raw, true) : null;
        }, null);
    const marks = { ...loadMarks("guest"), ...loadMarks(userId), ...(fallback?.marks ?? {}) };
    const profileId = fallback?.activeProfileId ?? "you";
    const events = mergeEventLists(fallback?.events ?? [], eventsFromMarkBook(marks, userId));
    if (!fallback && !events.length) return null;
    return {
      prefsVersion: PREFS_VERSION,
      events,
      marks,
      services: fallback?.services ?? [],
      profiles: fallback?.profiles ?? DEFAULT_PROFILES,
      activeProfileId: profileId,
      pendingAsks: fallback?.pendingAsks ?? [],
      englishOnly: fallback?.englishOnly ?? true,
      spoilerSafe: fallback?.spoilerSafe ?? true,
      tonight: fallback?.tonight ?? null,
      letterboxdUser: fallback?.letterboxdUser ?? "",
      gmail: fallback?.gmail ?? { ...EMPTY_GMAIL },
      tune: fallback?.tune ?? { ...DEFAULT_TUNE },
      handle: fallback?.handle ?? "",
      handlePublic: fallback?.handlePublic ?? true,
    };
  } catch {
    return null;
  }
}

async function pullRemote(userId: string) {
  try {
    const remote = (await withTimeout(pullKinoState({ data: {} }), 4000)) as { payload: unknown };
    const raw = remote.payload;
    if (!raw || typeof raw !== "object") return;
    const p = parsePersist(JSON.stringify(raw), false);
    if (!p) return;
    const state = useKino.getState();
    if (state.userId !== userId) return;
    const map = new Map<string, PreferenceEvent>();
    for (const e of [...state.events, ...p.events]) map.set(e.id, e);
    const events = [...map.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    const synced = syncedSet(userId);
    for (const e of p.events) synced.add(e.id);
    const remoteHasLife = p.events.length > 2 || Boolean(p.handle);
    useKino.setState({
      events,
      gmail: p.gmail.grok === "connected" ? p.gmail : state.gmail,
      handle: p.handle || state.handle,
      handlePublic: p.handle ? p.handlePublic : state.handlePublic,
      ...(remoteHasLife
        ? {
            services: p.services,
            profiles: p.profiles,
            pendingAsks: p.pendingAsks,
            activeProfileId: p.activeProfileId,
            englishOnly: p.englishOnly,
            spoilerSafe: p.spoilerSafe,
            tonight: p.tonight,
            letterboxdUser: p.letterboxdUser,
            tune: p.tune,
          }
        : {}),
    });
    useKino.getState().rebuildQueue(useKino.getState().queue[useKino.getState().index]?.movie.id);
  } catch {
    useKino.getState().flash({
      kind: "warn",
      title: "Account sync missed",
      body: "Using this device. Sign in again if taste should follow you.",
    });
  }
}

function parked(state: UserMovieState | undefined) {
  if (state?.owned && !state.seen && !state.favorited && !state.notInterested && !state.neverShowAgain) return false;
  return Boolean(state?.saved || state?.seen || state?.favorited || state?.notInterested || state?.neverShowAgain);
}

function assemble(state: KinoState, keep?: string | null, light = false) {
  const scoped = eventsFor(state);
  const now = new Date();
  const movieState = projectMovieState(scoped);
  const taste = light ? state.taste : rebuildTaste(scoped, now);
  const languageOk = (id: string) => !state.englishOnly || MOVIE_BY_ID[id]?.language === "en";
  const requested = keep === null ? undefined : (keep ?? state.queue[state.index]?.movie.id);
  const keepId = requested && !parked(movieState[requested]) && languageOk(requested) ? requested : undefined;
  const shown = sessionShownIds(scoped, state.sessionKey);
  for (const s of Object.values(movieState)) {
    if (parked(s)) shown.add(s.movieId);
    if (s.interested && !s.notInterested && !s.seen && !s.neverShowAgain) shown.delete(s.movieId);
  }
  const kind = state.profiles.find((p) => p.id === state.activeProfileId)?.kind;
  const forYou = state.feedMode !== "tune";
  const room = forYou ? state.tonight?.room : undefined;
  const kidsInRoom = Boolean(room?.includes("kids"));
  const rankingInput = {
    taste,
    movieState,
    events: scoped,
    now,
    subscribed: state.services,
    session: {
      who: forYou ? state.tonight?.who : undefined,
      mood: forYou ? state.tonight?.mood : null,
      genre: forYou ? state.tonight?.genre : null,
      service: forYou ? state.tonight?.service : null,
      fresh: forYou ? Boolean(state.tonight?.fresh) : false,
      tonight: forYou && Boolean(state.tonight?.mood || state.tonight?.genre || (state.tonight && state.tonight.who !== "Solo" && state.tonight.who !== "All") || room?.length),
      explore: !forYou,
      grokBoost: forYou ? state.grokBoost : undefined,
      profileKind: kidsInRoom ? "kids" : kind,
      englishOnly: state.englishOnly,
      subscribed: state.services,
      streamingOnly: forYou && state.tune.streamingOnly,
      preferFresh: forYou && state.tune.preferFresh,
      shortOnly: forYou && state.tune.shortOnly,
      familySafe: state.tune.familySafe || kidsInRoom,
      criticsFirst: forYou && state.tune.criticsFirst,
      wildcards: forYou && !state.tonight && state.tune.wildcards,
      era: forYou ? state.tune.era : "any",
      minutesLeft: forYou ? minutesUntilBed(now) : undefined,
      room,
    },
  };
  let ranks = state.ranks;
  const ranked = rank({
    ...rankingInput,
    limit: light ? 24 : 40,
    excludeIds: shown,
    includeIds: keepId ? new Set([keepId]) : undefined,
  }).recommendations;
  if (!light) {
    ranks = { ...state.ranks };
    for (const r of ranked) ranks[r.movie.id] = r;
  }
  const served = keepId
    ? state.queue.filter((r, i) => {
        if (r.movie.id === keepId) return true;
        if (i > state.index) return false;
        return !parked(movieState[r.movie.id]) && languageOk(r.movie.id);
      })
    : [];
  const queue = composeQueue(served, ranked, shown, keepId);
  let index = 0;
  if (keepId) {
    const found = queue.findIndex((r) => r.movie.id === keepId);
    index = found >= 0 ? found : 0;
  }
  return { movieState, taste, ranks, queue, index };
}

type ShelfCtx = { taste: TasteProfile };

function listed(
  movieState: Record<string, UserMovieState>,
  pred: (s: UserMovieState) => boolean,
  ctx?: ShelfCtx,
): Movie[] {
  const movies = Object.values(movieState)
    .filter(pred)
    .map((s) => MOVIE_BY_ID[s.movieId])
    .filter((m): m is Movie => Boolean(m));
  return ctx ? rankShelf(movies, { taste: ctx.taste, movieState }) : movies;
}

export function listSaved(movieState: Record<string, UserMovieState>, ctx?: ShelfCtx): Movie[] {
  return listed(movieState, (s) => s.saved && !s.notInterested, ctx);
}

export function listFavorites(movieState: Record<string, UserMovieState>, ctx?: ShelfCtx): Movie[] {
  return listed(movieState, (s) => s.favorited && !s.notInterested, ctx);
}

export function listInterested(movieState: Record<string, UserMovieState>, ctx?: ShelfCtx): Movie[] {
  return listed(movieState, (s) => s.interested && !s.notInterested, ctx);
}

export function listWatched(movieState: Record<string, UserMovieState>, ctx?: ShelfCtx): Movie[] {
  return listed(movieState, (s) => s.seen, ctx);
}

export function listPassed(movieState: Record<string, UserMovieState>, ctx?: ShelfCtx): Movie[] {
  return listed(movieState, (s) => s.notInterested, ctx);
}

function lastUserId() {
  if (typeof window === "undefined") return "guest";
  try {
    const id = localStorage.getItem(LAST_USER)?.trim();
    if (id && id !== "guest") return id;
  } catch {
    /* private mode */
  }
  return "guest";
}

function compactEvents(events: PreferenceEvent[]) {
  const noisy = new Set(["impression", "linger", "details_opened", "trailer_started", "search"]);
  const keep = events.filter((e) => !noisy.has(e.action));
  const noise = events.filter((e) => noisy.has(e.action)).slice(-80);
  const map = new Map<string, PreferenceEvent>();
  for (const e of [...keep, ...noise]) map.set(e.id, e);
  return [...map.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).slice(-900);
}

function reverseSource(state: KinoState, source: string): PreferenceEvent[] {
  const reversed = new Set(state.events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId as string));
  const now = new Date().toISOString();
  const undos: PreferenceEvent[] = [];
  for (const e of state.events) {
    if (e.source !== source || e.action === "undo" || reversed.has(e.id)) continue;
    undos.push({
      id: eventId(state.userId),
      userId: state.userId,
      profileId: e.profileId,
      entityType: "movie",
      entityId: e.entityId,
      action: "undo",
      source: "settings",
      sessionId: state.sessionKey,
      occurredAt: now,
      reversesId: e.id,
    });
  }
  return undos;
}

type MarkSnap = {
  saved?: boolean;
  favorited?: boolean;
  interested?: boolean;
  seen?: boolean;
  notInterested?: boolean;
};

function snapBook(events: PreferenceEvent[]): Record<string, Record<string, MarkSnap>> {
  const pids = new Set(events.map((e) => e.profileId).filter((p) => p && p !== "pending"));
  if (!pids.size) pids.add("you");
  const book: Record<string, Record<string, MarkSnap>> = {};
  for (const pid of pids) {
    book[pid] = snapMarks(events.filter((e) => e.profileId === pid || e.profileId === "everyone"));
  }
  return book;
}

function snapMarks(events: PreferenceEvent[]): Record<string, MarkSnap> {
  const out: Record<string, MarkSnap> = {};
  for (const s of Object.values(projectMovieState(events))) {
    if (!s.saved && !s.favorited && !s.interested && !s.seen && !s.notInterested) continue;
    out[s.movieId] = {
      ...(s.saved ? { saved: true } : {}),
      ...(s.favorited ? { favorited: true } : {}),
      ...(s.interested ? { interested: true } : {}),
      ...(s.seen ? { seen: true } : {}),
      ...(s.notInterested ? { notInterested: true } : {}),
    };
  }
  return out;
}

function synthMark(action: PreferenceAction, movieId: string, userId: string, profileId: string): PreferenceEvent {
  return {
    id: markEventId(userId, profileId, action, movieId),
    userId,
    profileId,
    entityType: "movie",
    entityId: movieId,
    action,
    source: "marks",
    sessionId: "marks",
    occurredAt: "2020-01-01T00:00:00.000Z",
  };
}

function eventsFromMarkBook(book: Record<string, Record<string, MarkSnap>> | undefined, userId: string) {
  if (!book) return [] as PreferenceEvent[];
  const out: PreferenceEvent[] = [];
  for (const [pid, marks] of Object.entries(book)) {
    out.push(...eventsFromMarks(marks, userId, pid));
  }
  return out;
}

function eventsFromMarks(marks: Record<string, MarkSnap> | undefined, userId: string, profileId: string) {
  if (!marks) return [] as PreferenceEvent[];
  const out: PreferenceEvent[] = [];
  for (const [movieId, m] of Object.entries(marks)) {
    if (m.saved) out.push(synthMark("save", movieId, userId, profileId));
    if (m.favorited) out.push(synthMark("favorite", movieId, userId, profileId));
    if (m.interested) out.push(synthMark("interested", movieId, userId, profileId));
    if (m.seen) out.push(synthMark("seen", movieId, userId, profileId));
    if (m.notInterested) out.push(synthMark("not_interested", movieId, userId, profileId));
  }
  return out;
}

function mergeEventLists(...lists: PreferenceEvent[][]) {
  const map = new Map<string, PreferenceEvent>();
  for (const list of lists) {
    for (const e of list) map.set(e.id, e);
  }
  return [...map.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

function markKey(userId: string) {
  return `kino.marks.${STORE_VERSION}.${userId}`;
}

let grokTimer = 0;
function scheduleGrok() {
  if (typeof window === "undefined") return;
  window.clearTimeout(grokTimer);
  grokTimer = window.setTimeout(() => {
    void useKino.getState().refreshGrok();
  }, 1600);
}

let rankTimer = 0;
function scheduleRank(keep?: string | null) {
  if (typeof window === "undefined") return;
  window.clearTimeout(rankTimer);
  rankTimer = window.setTimeout(() => {
    useKino.getState().rebuildQueue(keep, false);
  }, 280);
}

function bootSnapshot() {
  const userId = lastUserId();
  const local = loadLocal(userId);
  const draft = {
    ready: true,
    userId,
    signedIn: false,
    events: local?.events ?? [],
    movieState: {} as Record<string, UserMovieState>,
    taste: emptyTaste(),
    services: local?.services ?? [],
    profiles: local?.profiles ?? DEFAULT_PROFILES,
    activeProfileId: local?.activeProfileId ?? "you",
    pendingAsks: local?.pendingAsks ?? [],
    englishOnly: local?.englishOnly ?? true,
    spoilerSafe: local?.spoilerSafe ?? true,
    tonight: local?.tonight ?? null,
    letterboxdUser: local?.letterboxdUser ?? "",
    gmail: local?.gmail ?? { ...EMPTY_GMAIL },
    tune: local?.tune ?? { ...DEFAULT_TUNE },
    handle: local?.handle ?? "",
    handlePublic: local?.handlePublic ?? true,
    feedMode: "for-you" as const,
    grokNote: "",
    grokBoost: {} as Record<string, number>,
    queue: [] as RankedRecommendation[],
    ranks: {} as Record<string, RankedRecommendation>,
    index: 0,
    sessionKey: sessionId(),
    undo: null,
    trailerFor: null,
    trailerClip: null,
    scanning: false,
    importing: false,
    notice: null,
  };
  try {
    return { ...draft, ...assemble(draft as KinoState, null, true) };
  } catch {
    return draft;
  }
}

export const useKino = create<KinoState>((set, get) => ({
  ...bootSnapshot(),

  hydrate: async ({ userId, signedIn }) => {
    const state = get();
    if (!signedIn) {
      try {
        localStorage.removeItem(LAST_USER);
      } catch {
        /* ignore */
      }
    }
    if (state.ready && state.userId === userId && state.signedIn === signedIn) return;
    if (state.ready && state.userId === userId && signedIn && !state.signedIn) {
      set({ signedIn: true });
      await pullRemote(userId);
      persist(get(), true);
      return;
    }
    const local = loadLocal(userId);
    const guest = userId !== "guest" ? loadLocal("guest") : null;
    const carryGuest =
      userId !== "guest" &&
      (state.userId === "guest" || !state.ready) &&
      !(local?.events && local.events.length > 2);
    const sameUser = state.userId === userId;
    const events = mergeEventLists(
      carryGuest ? (guest?.events ?? []) : [],
      local?.events ?? [],
      sameUser ? state.events : [],
    ).map((e) => ({
      ...e,
      userId,
    }));
    const services = local?.services ?? guest?.services ?? [];
    const profiles = local?.profiles ?? guest?.profiles ?? DEFAULT_PROFILES;
    const activeProfileId = local?.activeProfileId ?? "you";
    const pendingAsks = local?.pendingAsks ?? [];
    const englishOnly = local?.englishOnly ?? true;
    const spoilerSafe = local?.spoilerSafe ?? true;
    const tonight = local?.tonight ?? null;
    const letterboxdUser = local?.letterboxdUser ?? "";
    const gmail = local?.gmail ?? guest?.gmail ?? { ...EMPTY_GMAIL };
    const tune = local?.tune ?? guest?.tune ?? { ...DEFAULT_TUNE };
    set({
      ready: true,
      userId,
      signedIn,
      events,
      services,
      profiles,
      activeProfileId,
      pendingAsks,
      englishOnly,
      spoilerSafe,
      tonight,
      letterboxdUser,
      gmail,
      tune,
      handle: local?.handle ?? "",
      handlePublic: local?.handlePublic ?? true,
      grokBoost: {},
      grokNote: "",
      sessionKey: get().sessionKey,
    });
    get().rebuildQueue(null, true);
    persist(get(), true);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        try {
          warmMovieFeatures();
        } catch {
          /* ignore */
        }
        const keep = get().queue[get().index]?.movie.id;
        get().rebuildQueue(keep, false);
      }, 700);
    }
    if (!signedIn) return;
    await pullRemote(userId);
    persist(get(), true);
  },

  rebuildQueue: (keep, light) => {
    try {
      const next = assemble(get(), keep, light);
      set(next);
      if (!light && get().feedMode === "for-you") scheduleGrok();
    } catch {
      get().flash({ kind: "err", title: "For you could not refresh", body: "The last queue is still here. Try again." });
    }
  },

  record: (action, movieId, extra) => {
    const current = get();
    const now = new Date().toISOString();
    const event: PreferenceEvent = {
      id: eventId(current.userId),
      userId: current.userId,
      profileId: extra?.profileId ?? current.activeProfileId,
      entityType: "movie",
      entityId: movieId,
      action,
      source: extra?.source ?? "feed",
      sessionId: current.sessionKey,
      occurredAt: now,
      reversesId: extra?.reversesId,
      strength: extra?.strength,
    };
    const events = [...current.events.filter((e) => e.id !== event.id), event];
    const movieState = projectMovieState(eventsFor({ ...current, events }));
    const undoable = [
      "skip",
      "save",
      "unsave",
      "favorite",
      "unfavorite",
      "interested",
      "uninterested",
      "not_interested",
      "show_again",
      "seen",
      "unseen",
      "love",
    ].includes(action);
    const skipRank =
      action === "linger" ||
      action === "details_opened" ||
      action === "trailer_started" ||
      action === "search" ||
      action === "impression";
    const advance =
      action === "skip" ||
      action === "not_interested" ||
      action === "seen" ||
      action === "save" ||
      action === "favorite";
    let index = current.index;
    let keep: string | null | undefined = current.queue[current.index]?.movie.id;
    const currentId = current.queue[current.index]?.movie.id;
    const onCard = currentId === movieId;
    if (action === "undo") keep = movieId;
    if (advance && onCard) {
      const rest = current.queue.filter((r) => r.movie.id !== movieId && !parked(movieState[r.movie.id]));
      const next =
        current.queue.slice(current.index + 1).find((r) => r.movie.id !== movieId && !parked(movieState[r.movie.id])) ??
        rest[0];
      keep = next?.movie.id ?? null;
      const queue = next ? [next, ...rest.filter((r) => r.movie.id !== next.movie.id)] : rest;
      set({
        events,
        movieState,
        queue,
        index: 0,
        undo: undoable ? { eventId: event.id, label: extra?.label ?? action } : null,
      });
    } else {
      set({
        events,
        movieState,
        index,
        undo: undoable
          ? { eventId: event.id, label: extra?.label ?? action }
          : action === "undo"
            ? null
            : current.undo,
      });
    }
    persist(get(), !skipRank);
    if (skipRank) return;
    window.setTimeout(() => get().rebuildQueue(keep, true), advance ? 40 : 0);
    scheduleRank(keep);
  },

  undoLast: () => {
    const undo = get().undo;
    if (!undo) return;
    const original = get().events.find((e) => e.id === undo.eventId);
    set({ undo: null });
    if (!original) return;
    get().record("undo", original.entityId, { source: "undo", reversesId: original.id, profileId: original.profileId });
  },

  setIndex: (i) => {
    set({ index: i });
    const rec = get().queue[i];
    if (!rec) return;
    const st = get().movieState[rec.movie.id];
    const stale = !st?.lastImpressionAt || Date.now() - new Date(st.lastImpressionAt).getTime() > 6 * 36e5;
    if (stale) get().record("impression", rec.movie.id, { source: "feed" });
  },

  setServices: (services) => {
    set({ services });
    persist(get());
    get().rebuildQueue(get().queue[get().index]?.movie.id);
  },

  setEnglishOnly: (englishOnly) => {
    set({ englishOnly });
    persist(get());
    get().rebuildQueue(null);
  },

  setSpoilerSafe: (spoilerSafe) => {
    set({ spoilerSafe });
    persist(get());
  },

  setTune: (patch) => {
    set({ tune: { ...get().tune, ...patch } });
    persist(get());
    get().rebuildQueue(get().queue[get().index]?.movie.id);
  },

  setLetterboxdUser: (letterboxdUser) => {
    set({ letterboxdUser });
    persist(get());
  },

  setActiveProfile: (id) => {
    set({ activeProfileId: id, index: 0 });
    persist(get());
    get().rebuildQueue(null);
  },

  renameProfile: (id, name) => {
    set({
      profiles: get().profiles.map((p) => (p.id === id ? { ...p, name } : p)),
    });
    persist(get());
  },

  setTonight: (tonight) => {
    set({ tonight, index: 0, grokBoost: {}, grokNote: "" });
    persist(get());
    get().rebuildQueue(null);
  },

  setFeedMode: (feedMode) => {
    if (get().feedMode === feedMode) return;
    set({ feedMode, index: 0, queue: [], grokBoost: {}, grokNote: "" });
    get().rebuildQueue(null, false);
  },

  refreshGrok: async () => {
    const state = get();
    if (state.feedMode !== "for-you") return;
    const trained = Math.max(state.taste.trainedOn ?? 0, signalCount(state.events));
    if (trained < 3) return;
    const slice = state.queue.slice(0, 20);
    if (slice.length < 6) return;
    const likes: string[] = [];
    const passes: string[] = [];
    for (const s of Object.values(state.movieState)) {
      const movie = MOVIE_BY_ID[s.movieId];
      if (!movie) continue;
      if (s.favorited || s.interested || s.sentiment === "love" || s.sentiment === "like" || s.seen) likes.push(movie.title);
      if (s.notInterested) passes.push(movie.title);
    }
    try {
      const res = await grokRerank({
        data: {
          likes: likes.slice(0, 24),
          passes: passes.slice(0, 24),
          candidates: slice.map((r) => ({
            id: r.movie.id,
            title: r.movie.title,
            year: r.movie.year,
            genres: r.movie.genres.slice(0, 3),
            director: r.movie.director,
          })),
          who: state.tonight?.who ?? null,
          mood: state.tonight?.mood ?? null,
          genre: state.tonight?.genre ?? null,
          minutesLeft: minutesUntilBed(),
        },
      });
      if (!res.ok) return;
      const current = get();
      if (current.feedMode !== "for-you") return;
      const keep = current.queue[current.index]?.movie.id;
      const boost: Record<string, number> = {};
      res.ids.forEach((id, i) => {
        boost[id] = Math.max(0, 0.18 - i * 0.008);
      });
      const byId = new Map(current.queue.map((r) => [r.movie.id, r]));
      const head: RankedRecommendation[] = [];
      const used = new Set<string>();
      if (keep && byId.has(keep)) {
        const k = byId.get(keep)!;
        head.push({ ...k, matchLabel: k.matchLabel === "Acclaimed" ? k.matchLabel : "Grok" });
        used.add(keep);
      }
      for (const id of res.ids) {
        if (used.has(id)) continue;
        const rec = byId.get(id);
        if (!rec) continue;
        head.push({
          ...rec,
          matchLabel: "Grok",
          statement: res.note || rec.statement,
        });
        used.add(id);
      }
      for (const rec of current.queue) {
        if (used.has(rec.movie.id)) continue;
        head.push(rec);
        used.add(rec.movie.id);
      }
      set({ queue: head, grokBoost: boost, grokNote: res.note, index: keep ? head.findIndex((r) => r.movie.id === keep) : current.index });
    } catch {
      /* local rank stays */
    }
  },

  answerAsk: (movieId, profileId) => {
    if (profileId === "skip") {
      get().deferAsk();
      return;
    }
    const asks = get().pendingAsks.filter((a) => a.movieId !== movieId);
    const current = get();
    const existing = current.events.find(
      (e) => e.entityId === movieId && (e.action === "import_seen" || e.action === "import_watchlist"),
    );
    const now = new Date().toISOString();
    const extra: PreferenceEvent[] = [];
    if (existing) {
      extra.push({
        id: eventId(current.userId),
        userId: current.userId,
        profileId: existing.profileId,
        entityType: "movie",
        entityId: movieId,
        action: "undo",
        source: "household",
        sessionId: current.sessionKey,
        occurredAt: now,
        reversesId: existing.id,
      });
      extra.push({
        ...existing,
        id: eventId(current.userId),
        profileId,
        occurredAt: now,
        source: "household",
        sessionId: current.sessionKey,
      });
      set({ pendingAsks: asks, events: [...current.events, ...extra] });
    } else {
      set({ pendingAsks: asks });
      get().record("import_seen", movieId, { source: "household", profileId });
      return;
    }
    persist(get(), true);
    get().rebuildQueue(get().queue[get().index]?.movie.id);
  },

  deferAsk: () => {
    const [first, ...rest] = get().pendingAsks;
    if (!first) return;
    set({ pendingAsks: rest });
    persist(get());
  },

  ingestHits: (hits, askHousehold) => {
    if (!hits.length) return 0;
    const state = get();
    const existing = new Set(
      state.events
        .filter((e) => e.action === "import_seen" || e.action === "import_watchlist" || e.action === "seen" || e.action === "save")
        .map((e) => e.entityId),
    );
    const extra: PreferenceEvent[] = [];
    const asks: PendingAsk[] = [...state.pendingAsks];
    const now = new Date().toISOString();
    for (const hit of hits) {
      if (existing.has(hit.movieId)) continue;
      existing.add(hit.movieId);
      const movie = MOVIE_BY_ID[hit.movieId];
      const familyTitle = Boolean(movie && movie.audience !== "adult");
      extra.push({
        id: eventId(state.userId),
        userId: state.userId,
        profileId: askHousehold && familyTitle ? "pending" : state.activeProfileId,
        entityType: "movie",
        entityId: hit.movieId,
        action: hit.action,
        source: hit.source,
        sessionId: state.sessionKey,
        occurredAt: now,
        strength: hit.rating ? Math.min(1.2, hit.rating / 5) : undefined,
      });
      if (askHousehold && movie && movie.audience !== "adult" && !asks.some((a) => a.movieId === movie.id)) {
        asks.push({ movieId: movie.id, title: movie.title, source: hit.source });
      }
    }
    if (!extra.length) return 0;
    set({ events: [...state.events, ...extra], pendingAsks: asks });
    persist(get());
    get().rebuildQueue(get().queue[get().index]?.movie.id);
    return extra.length;
  },

  importText: async (input) => {
    if (get().importing) {
      get().flash({ kind: "warn", title: "Already importing" });
      return { ok: false, count: 0, error: "Already importing." };
    }
    set({ importing: true });
    try {
      const hits: ImportHit[] = [];
      if (input.text?.trim()) hits.push(...parseImportText(input.text));
      if (input.username?.trim()) {
        try {
          const res = await importLibrary({ data: { username: input.username } });
          hits.push(...res.hits);
        } catch {
          get().flash({
            kind: "err",
            title: "Letterboxd did not answer",
            body: "Check the username. Diary must be public.",
          });
          set({ importing: false });
          return { ok: false, count: 0, error: "Letterboxd did not answer." };
        }
      }
      const uniq = new Map<string, ImportHit>();
      for (const h of hits) uniq.set(h.movieId, h);
      const n = get().ingestHits([...uniq.values()], true);
      set({ importing: false });
      if (!n) {
        const error = uniq.size
          ? "Those titles are already in TasteRank."
          : "No catalog titles in that Letterboxd diary yet.";
        get().flash({ kind: "warn", title: "Nothing new imported", body: error });
        return { ok: false, count: 0, error };
      }
      get().flash({
        kind: "ok",
        title: "Letterboxd pull worked",
        body: `${n} film${n === 1 ? "" : "s"} added to TasteRank.`,
      });
      return { ok: true, count: n };
    } catch {
      set({ importing: false });
      get().flash({ kind: "err", title: "Import failed", body: "Could not reach Letterboxd just now." });
      return { ok: false, count: 0, error: "Could not import right now." };
    }
  },

  checkGrok: async () => {
    set({ gmail: { ...get().gmail, grok: "checking", message: "Checking Grok…" } });
    get().flash({ kind: "info", title: "Checking Grok…" });
    try {
      try {
        const status = await fetch("/api/grok-status", { credentials: "same-origin" });
        if (status.ok) {
          const body = (await status.json()) as { connected?: boolean };
          if (body.connected) {
            set({
              gmail: {
                ...get().gmail,
                grok: "connected",
                message: "Grok is connected. Gmail is ready to scan.",
                at: new Date().toISOString(),
              },
            });
            persist(get());
            get().flash({ kind: "ok", title: "Grok is connected", body: "Gmail is ready to scan." });
            return { connected: true };
          }
        }
      } catch {
        /* fall through to probe */
      }
      const res = await withTimeout(probeGmail({ data: {} }), 12000);
      if (res.connected) {
        set({
          gmail: {
            ...get().gmail,
            grok: "connected",
            message: "Grok is connected. Gmail is ready to scan.",
            at: new Date().toISOString(),
          },
        });
        persist(get());
        get().flash({ kind: "ok", title: "Grok is connected", body: "Gmail is ready to scan." });
        return { connected: true };
      }
      const loginRequired = Boolean(res.loginRequired);
      set({
        gmail: {
          ...get().gmail,
          grok: loginRequired ? "needs_login" : "error",
          message: res.error ?? (loginRequired ? "Grok is not connected." : "Grok check failed."),
          at: new Date().toISOString(),
        },
      });
      persist(get());
      get().flash({
        kind: loginRequired ? "err" : "err",
        title: loginRequired ? "Grok is not connected" : "Grok check failed",
        body: res.error ?? "Continue with Grok, then check again.",
      });
      return { connected: false, loginRequired, loginUrl: res.loginUrl };
    } catch (e) {
      const timeout = e instanceof Error && e.message === "timeout";
      const prior = get().gmail;
      if (timeout && prior.grok === "connected") {
        set({
          gmail: {
            ...prior,
            grok: "connected",
            message: "Still connected. Check timed out — Scan Gmail if you want a refresh.",
          },
        });
        persist(get());
        get().flash({ kind: "warn", title: "Grok check timed out", body: "Keeping the saved connection." });
        return { connected: true };
      }
      const message = timeout ? "Grok check timed out." : "Could not reach Grok.";
      set({ gmail: { ...prior, grok: "error", message, at: new Date().toISOString() } });
      persist(get());
      get().flash({ kind: "err", title: "Grok check failed", body: message });
      return { connected: false };
    }
  },

  scanMail: async () => {
    if (get().scanning) {
      get().flash({ kind: "warn", title: "Already reading Gmail" });
      return { ok: false, count: 0, error: "Already reading mail." };
    }
    set({
      scanning: true,
      gmail: { ...get().gmail, scan: "scanning", message: "Reading Gmail…" },
    });
    get().flash({ kind: "info", title: "Reading Gmail…" });
    try {
      const lib = await withTimeout(pullMailLibrary({ data: {} }), 18000);
      set({ scanning: false });
      if (lib.loginRequired && !lib.hits.length) {
        const message = "Grok is not connected. Continue with Grok, then scan Gmail.";
        set({
          gmail: {
            grok: "needs_login",
            scan: "error",
            count: 0,
            total: get().gmail.total,
            message,
            at: new Date().toISOString(),
          },
        });
        persist(get());
        get().flash({ kind: "err", title: "Grok is not connected", body: message });
        return { ok: false, count: 0, loginRequired: true, loginUrl: lib.loginUrl, error: message };
      }
      const n = get().ingestHits(lib.hits, true);
      if (n) {
        const total = (get().gmail.total ?? 0) + n;
        const message = `Gmail scan worked. Added ${n} film${n === 1 ? "" : "s"}. ${total} from Gmail in TasteRank.`;
        set({
          gmail: {
            grok: "connected",
            scan: "ok",
            count: n,
            total,
            message,
            at: new Date().toISOString(),
          },
        });
        persist(get());
        get().flash({ kind: "ok", title: "Gmail scan worked", body: message });
        return { ok: true, count: n };
      }
      const empty = lib.connected
        ? "Grok is connected. Gmail had no catalog titles this time."
        : (lib.error ?? "Gmail answered, but no catalog titles matched.");
        set({
          gmail: {
            grok: lib.connected ? "connected" : get().gmail.grok,
            scan: "empty",
            count: 0,
            total: get().gmail.total,
            message: empty,
            at: new Date().toISOString(),
          },
        });
      persist(get());
      get().flash({ kind: "warn", title: "Scan finished. Nothing new.", body: empty });
      return { ok: true, count: 0, error: empty };
    } catch (e) {
      set({ scanning: false });
      const msg = e instanceof Error ? e.message : "";
      if (msg === "Unauthorized") {
        const message = "Grok is not connected. Continue with Grok, then scan Gmail.";
        set({
          gmail: { grok: "needs_login", scan: "error", count: 0, total: get().gmail.total, message, at: new Date().toISOString() },
        });
        persist(get());
        get().flash({ kind: "err", title: "Grok is not connected", body: message });
        return { ok: false, count: 0, loginRequired: true, error: message };
      }
      const message = msg === "timeout" ? "Gmail timed out. Try again." : "Could not reach Gmail just now.";
      set({
        gmail: { ...get().gmail, scan: "error", message, at: new Date().toISOString() },
      });
      persist(get());
      get().flash({ kind: "err", title: "Gmail scan failed", body: message });
      return { ok: false, count: 0, error: message };
    }
  },

  markGrokConnected: () => {
    if (get().gmail.grok === "disconnected") return;
    set({
      gmail: {
        ...get().gmail,
        grok: "connected",
        message: "Grok is connected. Gmail is ready to scan.",
        at: new Date().toISOString(),
      },
    });
    persist(get());
  },

  disconnectGrok: () => {
    const total = get().gmail.total;
    set({
      gmail: {
        grok: "disconnected",
        scan: "idle",
        count: 0,
        total,
        message: total
          ? `Disconnected. ${total} Gmail film${total === 1 ? "" : "s"} stay in TasteRank until you forget them.`
          : "Disconnected. Connect again when you want Gmail.",
        at: new Date().toISOString(),
      },
    });
    persist(get());
    get().flash({
      kind: "ok",
      title: "Grok disconnected",
      body: total ? "Imported films stay. Forget Gmail films if you want them gone." : "Grok and Gmail are off.",
    });
  },

  forgetMailImports: () => {
    const undos = reverseSource(get(), "mail");
    const n = undos.length;
    set({
      events: n ? [...get().events, ...undos] : get().events,
      gmail: {
        ...get().gmail,
        total: 0,
        count: 0,
        scan: "idle",
        message: n ? `Removed ${n} Gmail film${n === 1 ? "" : "s"} from TasteRank.` : "No Gmail films to remove.",
        at: new Date().toISOString(),
      },
    });
    persist(get(), true);
    get().rebuildQueue(null);
    get().flash({
      kind: n ? "ok" : "warn",
      title: n ? "Gmail films removed" : "Nothing to forget",
      body: n ? `${n} import${n === 1 ? "" : "s"} dropped from TasteRank.` : "TasteRank had no Gmail titles.",
    });
    return n;
  },

  disconnectLetterboxd: () => {
    const undos = reverseSource(get(), "letterboxd");
    const n = undos.length;
    set({ events: n ? [...get().events, ...undos] : get().events, letterboxdUser: "" });
    persist(get(), true);
    get().rebuildQueue(null);
    get().flash({
      kind: "ok",
      title: "Letterboxd disconnected",
      body: n ? `Removed ${n} diary film${n === 1 ? "" : "s"}.` : "Username cleared.",
    });
    return n;
  },

  claimHandle: async (raw) => {
    const { claimHandle } = await import("./server/public");
    const { normalizeHandle, handleError } = await import("./handle");
    const handle = normalizeHandle(raw);
    const err = handleError(handle);
    if (err) {
      get().flash({ kind: "err", title: "Can’t use that name", body: err });
      return { ok: false, error: err };
    }
    try {
      const res = await claimHandle({ data: { handle, public: get().handlePublic } });
      if (!res.ok) {
        get().flash({ kind: "err", title: "Name not saved", body: res.error });
        return { ok: false, error: res.error };
      }
      set({ handle: res.handle });
      persist(get(), true);
      get().flash({ kind: "ok", title: `@${res.handle} is yours` });
      return { ok: true };
    } catch {
      get().flash({ kind: "err", title: "Name not saved", body: "Sign in and try again." });
      return { ok: false, error: "Sign in and try again." };
    }
  },

  setHandlePublic: (handlePublic) => {
    set({ handlePublic });
    persist(get(), true);
    if (!get().signedIn || !get().handle) return;
    void import("./server/public").then(({ setHandlePublic }) =>
      setHandlePublic({ data: { public: handlePublic } }).catch(() => undefined),
    );
  },

  flash: (notice) => {
    set({ notice: { ...notice, id: eventId() } });
  },

  clearNotice: () => set({ notice: null }),

  openTrailer: (id, clip) => {
    set({ trailerFor: id, trailerClip: id ? clip ?? null : null });
    if (id) get().record("trailer_started", id, { source: "viewport" });
  },

  flushSync: () => persist(get(), true),
}));
