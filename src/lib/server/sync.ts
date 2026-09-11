import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { bumpStats, ensureUserHandle } from "./public";
import { rateLimit } from "./rate-limit";

const EventRow = z.object({
  id: z.string().min(1).max(120),
  profileId: z.string().min(1).max(40),
  entityId: z.string().min(1).max(160),
  action: z.string().min(1).max(40),
  source: z.string().min(1).max(40),
  sessionId: z.string().max(80).optional(),
  occurredAt: z.string().min(1).max(40),
  reversesId: z.string().max(120).optional(),
  strength: z.number().optional(),
});

const ProfileRow = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  kind: z.enum(["self", "partner", "kids", "other"]),
});

const TuneRow = z.object({
  streamingOnly: z.boolean(),
  preferFresh: z.boolean(),
  shortOnly: z.boolean(),
  familySafe: z.boolean(),
  criticsFirst: z.boolean(),
  wildcards: z.boolean(),
  era: z.enum(["any", "5", "15", "30", "classic"]),
});

const TonightRow = z
  .object({
    who: z.string().min(1).max(40),
    mood: z.string().max(40).nullable(),
    genre: z.string().max(40).nullable(),
    service: z.string().max(80).nullable().optional(),
    fresh: z.boolean().optional(),
  })
  .nullable();

const GmailRow = z.object({
  grok: z.string().max(40),
  scan: z.string().max(40),
  count: z.number(),
  total: z.number(),
  message: z.string().max(2000),
  at: z.string().max(40).nullish(),
});

const PrefsPayload = z.object({
  services: z.array(z.string().max(40)).max(24),
  profiles: z.array(ProfileRow).min(1).max(8),
  activeProfileId: z.string().min(1).max(40),
  pendingAsks: z
    .array(
      z.object({
        movieId: z.string().max(160),
        title: z.string().max(200),
        source: z.string().max(40),
      }),
    )
    .max(40),
  englishOnly: z.boolean(),
  spoilerSafe: z.boolean(),
  tonight: TonightRow,
  letterboxdUser: z.string().max(80),
  gmail: GmailRow,
  tune: TuneRow,
  events: z.array(EventRow).max(400).optional(),
}).passthrough();

type EventIn = z.infer<typeof EventRow>;

type MovieFlags = {
  profileId: string;
  movieId: string;
  seen: boolean;
  saved: boolean;
  favorited: boolean;
  interested: boolean;
  notInterested: boolean;
  neverShowAgain: boolean;
  skipCount: number;
  impressionCount: number;
  lastSkippedAt: string | null;
  lastImpressionAt: string | null;
  sentiment: string | null;
};

function emptyFlags(profileId: string, movieId: string): MovieFlags {
  return {
    profileId,
    movieId,
    seen: false,
    saved: false,
    favorited: false,
    interested: false,
    notInterested: false,
    neverShowAgain: false,
    skipCount: 0,
    impressionCount: 0,
    lastSkippedAt: null,
    lastImpressionAt: null,
    sentiment: null,
  };
}

function applyAction(s: MovieFlags, action: string, at: string) {
  switch (action) {
    case "impression":
      s.impressionCount += 1;
      s.lastImpressionAt = at;
      break;
    case "seen":
    case "love":
    case "like":
    case "neutral":
    case "dislike":
    case "import_seen":
      s.seen = true;
      s.neverShowAgain = true;
      if (action === "love" || action === "like" || action === "neutral" || action === "dislike") {
        s.sentiment = action;
      }
      break;
    case "save":
    case "import_watchlist":
      s.saved = true;
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
      s.lastSkippedAt = at;
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
      s.sentiment = null;
      s.neverShowAgain = s.notInterested;
      break;
    default:
      break;
  }
}

function toEvent(row: {
  id: string;
  profile_id: string;
  movie_id: string;
  action: string;
  source: string;
  session_id: string | null;
  occurred_at: string | Date;
  reverses_id: string | null;
  strength: number | null;
}) {
  const occurred =
    row.occurred_at instanceof Date ? row.occurred_at.toISOString() : String(row.occurred_at);
  return {
    id: row.id,
    profileId: row.profile_id,
    entityType: "movie" as const,
    entityId: row.movie_id,
    action: row.action,
    source: row.source,
    sessionId: row.session_id ?? "",
    occurredAt: occurred,
    ...(row.reverses_id ? { reversesId: row.reverses_id } : {}),
    ...(row.strength != null ? { strength: row.strength } : {}),
  };
}

async function insertEvents(sql: Sql, userId: string, events: unknown[]) {
  const rows = events.flatMap((e) => {
    const parsed = EventRow.safeParse(e);
    return parsed.success ? [parsed.data] : [];
  });
  if (!rows.length) return [] as EventIn[];
  const json = JSON.stringify(
    rows.map((e) => ({
      id: e.id,
      profile_id: e.profileId,
      entity_id: e.entityId,
      action: e.action,
      source: e.source,
      session_id: e.sessionId ?? "",
      occurred_at: e.occurredAt,
      reverses_id: e.reversesId ?? null,
      strength: e.strength ?? null,
    })),
  );
  await sql.query(
    `insert into kino_events (id, user_id, profile_id, movie_id, action, source, session_id, occurred_at, reverses_id, strength)
     select x.id, $1, x.profile_id, x.entity_id, x.action, x.source, x.session_id, x.occurred_at::timestamptz, x.reverses_id, x.strength
     from jsonb_to_recordset($2::jsonb) as x(
       id text, profile_id text, entity_id text, action text, source text, session_id text, occurred_at text, reverses_id text, strength float
     )
     on conflict (id) do update
     set action = excluded.action,
         occurred_at = excluded.occurred_at,
         reverses_id = excluded.reverses_id,
         strength = excluded.strength
     where kino_events.user_id = $1`,
    [userId, json],
  );
  try {
    await bumpStats(sql, rows.map((r) => r.action));
  } catch {
    /* events already stored */
  }
  try {
    await patchMovieState(sql, userId, rows);
  } catch {
    /* events already stored */
  }
  return rows;
}

async function patchMovieState(sql: Sql, userId: string, rows: EventIn[]) {
  const pairs = [...new Map(rows.map((e) => [`${e.profileId}:${e.entityId}`, { profile_id: e.profileId, movie_id: e.entityId }])).values()];
  if (!pairs.length) return;
  const eventRows = await sql.query<{
    id: string;
    profile_id: string;
    movie_id: string;
    action: string;
    source: string;
    session_id: string | null;
    occurred_at: string | Date;
    reverses_id: string | null;
    strength: number | null;
  }>(
    `select id, profile_id, movie_id, action, source, session_id, occurred_at, reverses_id, strength
     from kino_events
     where user_id = $1
       and (profile_id, movie_id) in (
         select x.profile_id, x.movie_id
         from jsonb_to_recordset($2::jsonb) as x(profile_id text, movie_id text)
       )
     order by occurred_at asc`,
    [userId, JSON.stringify(pairs)],
  );
  const reversed = new Set<string>();
  for (const row of eventRows) {
    if (row.action === "undo" && row.reverses_id) reversed.add(row.reverses_id);
  }
  const seen = new Set<string>();
  const map = new Map<string, MovieFlags>();
  for (const row of eventRows) {
    if (seen.has(row.id) || reversed.has(row.id) || row.action === "undo") continue;
    seen.add(row.id);
    const key = `${row.profile_id}:${row.movie_id}`;
    const flags = map.get(key) ?? emptyFlags(row.profile_id, row.movie_id);
    const at = row.occurred_at instanceof Date ? row.occurred_at.toISOString() : String(row.occurred_at);
    applyAction(flags, row.action, at);
    map.set(key, flags);
  }
  const states = [...map.values()];
  if (!states.length) return;
  await upsertFlags(sql, userId, states);
}

async function rebuildMovieState(sql: Sql, userId: string) {
  const eventRows = await sql.query<{
    id: string;
    profile_id: string;
    movie_id: string;
    action: string;
    source: string;
    session_id: string | null;
    occurred_at: string | Date;
    reverses_id: string | null;
    strength: number | null;
  }>(
    `select id, profile_id, movie_id, action, source, session_id, occurred_at, reverses_id, strength
     from kino_events where user_id = $1 order by occurred_at asc`,
    [userId],
  );
  const reversed = new Set<string>();
  for (const row of eventRows) {
    if (row.action === "undo" && row.reverses_id) reversed.add(row.reverses_id);
  }
  const seen = new Set<string>();
  const map = new Map<string, MovieFlags>();
  for (const row of eventRows) {
    if (seen.has(row.id) || reversed.has(row.id) || row.action === "undo") continue;
    seen.add(row.id);
    const key = `${row.profile_id}:${row.movie_id}`;
    const flags = map.get(key) ?? emptyFlags(row.profile_id, row.movie_id);
    const at = row.occurred_at instanceof Date ? row.occurred_at.toISOString() : String(row.occurred_at);
    applyAction(flags, row.action, at);
    map.set(key, flags);
  }
  const states = [...map.values()];
  if (!states.length) return;
  await upsertFlags(sql, userId, states);
}

async function upsertFlags(sql: Sql, userId: string, states: MovieFlags[]) {
  if (!states.length) return;
  await sql.query(
    `insert into kino_movie_state (
       user_id, profile_id, movie_id, seen, saved, favorited, interested, not_interested,
       never_show_again, skip_count, impression_count, last_skipped_at, last_impression_at, sentiment, updated_at
     )
     select $1, x.profile_id, x.movie_id, x.seen, x.saved, x.favorited, x.interested, x.not_interested,
            x.never_show_again, x.skip_count, x.impression_count,
            nullif(x.last_skipped_at, '')::timestamptz, nullif(x.last_impression_at, '')::timestamptz,
            nullif(x.sentiment, ''), now()
     from jsonb_to_recordset($2::jsonb) as x(
       profile_id text, movie_id text, seen boolean, saved boolean, favorited boolean, interested boolean,
       not_interested boolean, never_show_again boolean, skip_count int, impression_count int,
       last_skipped_at text, last_impression_at text, sentiment text
     )
     on conflict (user_id, profile_id, movie_id) do update set
       seen = excluded.seen,
       saved = excluded.saved,
       favorited = excluded.favorited,
       interested = excluded.interested,
       not_interested = excluded.not_interested,
       never_show_again = excluded.never_show_again,
       skip_count = excluded.skip_count,
       impression_count = excluded.impression_count,
       last_skipped_at = excluded.last_skipped_at,
       last_impression_at = excluded.last_impression_at,
       sentiment = excluded.sentiment,
       updated_at = now()`,
    [
      userId,
      JSON.stringify(
        states.map((s) => ({
          profile_id: s.profileId,
          movie_id: s.movieId,
          seen: s.seen,
          saved: s.saved,
          favorited: s.favorited,
          interested: s.interested,
          not_interested: s.notInterested,
          never_show_again: s.neverShowAgain,
          skip_count: s.skipCount,
          impression_count: s.impressionCount,
          last_skipped_at: s.lastSkippedAt ?? "",
          last_impression_at: s.lastImpressionAt ?? "",
          sentiment: s.sentiment ?? "",
        })),
      ),
    ],
  );
}

async function upsertPrefs(sql: Sql, userId: string, data: z.infer<typeof PrefsPayload>) {
  await sql.query(
    `insert into kino_prefs (
       user_id, english_only, spoiler_safe, era, streaming_only, prefer_fresh, short_only,
       family_safe, critics_first, wildcards, services, active_profile_id, tonight, pending_asks, updated_at
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, now()
     )
     on conflict (user_id) do update set
       english_only = excluded.english_only,
       spoiler_safe = excluded.spoiler_safe,
       era = excluded.era,
       streaming_only = excluded.streaming_only,
       prefer_fresh = excluded.prefer_fresh,
       short_only = excluded.short_only,
       family_safe = excluded.family_safe,
       critics_first = excluded.critics_first,
       wildcards = excluded.wildcards,
       services = excluded.services,
       active_profile_id = excluded.active_profile_id,
       tonight = excluded.tonight,
       pending_asks = excluded.pending_asks,
       updated_at = now()`,
    [
      userId,
      data.englishOnly,
      data.spoilerSafe,
      data.tune.era,
      data.tune.streamingOnly,
      data.tune.preferFresh,
      data.tune.shortOnly,
      data.tune.familySafe,
      data.tune.criticsFirst,
      data.tune.wildcards,
      data.services,
      data.activeProfileId,
      JSON.stringify(data.tonight),
      JSON.stringify(data.pendingAsks),
    ],
  );

  await sql.query(`delete from kino_profile where user_id = $1`, [userId]);
  if (data.profiles.length) {
    await sql.query(
      `insert into kino_profile (id, user_id, name, kind)
       select x.id, $1, x.name, x.kind
       from jsonb_to_recordset($2::jsonb) as x(id text, name text, kind text)
       on conflict (user_id, id) do update set name = excluded.name, kind = excluded.kind`,
      [userId, JSON.stringify(data.profiles)],
    );
  }

  const connections = [
    {
      kind: "letterboxd",
      status: data.letterboxdUser ? "connected" : "unknown",
      handle: data.letterboxdUser,
      count: 0,
      total: 0,
      message: "",
      at: null as string | null,
    },
    {
      kind: "grok",
      status: data.gmail.grok,
      handle: "",
      count: 0,
      total: 0,
      message: "",
      at: data.gmail.at ?? null,
    },
    {
      kind: "gmail",
      status: data.gmail.scan,
      handle: "",
      count: data.gmail.count,
      total: data.gmail.total,
      message: data.gmail.message,
      at: data.gmail.at ?? null,
    },
  ];
  await sql.query(
    `insert into kino_connection (user_id, kind, status, handle, count, total, message, at, updated_at)
     select $1, x.kind, x.status, x.handle, x.count, x.total, x.message, nullif(x.at, '')::timestamptz, now()
     from jsonb_to_recordset($2::jsonb) as x(
       kind text, status text, handle text, count int, total int, message text, at text
     )
     on conflict (user_id, kind) do update set
       status = excluded.status,
       handle = excluded.handle,
       count = excluded.count,
       total = excluded.total,
       message = excluded.message,
       at = excluded.at,
       updated_at = now()`,
    [
      userId,
      JSON.stringify(
        connections.map((c) => ({
          ...c,
          at: c.at ?? "",
        })),
      ),
    ],
  );
}

export const pullKinoState = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId;
    const prefs = await sql.query<{
      english_only: boolean;
      spoiler_safe: boolean;
      era: string;
      streaming_only: boolean;
      prefer_fresh: boolean;
      short_only: boolean;
      family_safe: boolean;
      critics_first: boolean;
      wildcards: boolean;
      services: string[] | null;
      active_profile_id: string;
      tonight: unknown;
      pending_asks: unknown;
    }>(`select * from kino_prefs where user_id = $1 limit 1`, [userId]);
    const profiles = await sql.query<{ id: string; name: string; kind: string }>(
      `select id, name, kind from kino_profile where user_id = $1`,
      [userId],
    );
    const connections = await sql.query<{
      kind: string;
      status: string;
      handle: string;
      count: number;
      total: number;
      message: string;
      at: string | Date | null;
    }>(`select kind, status, handle, count, total, message, at from kino_connection where user_id = $1`, [userId]);
    const page = await ensureUserHandle(sql, userId);
    const eventRows = await sql.query<{
      id: string;
      profile_id: string;
      movie_id: string;
      action: string;
      source: string;
      session_id: string | null;
      occurred_at: string | Date;
      reverses_id: string | null;
      strength: number | null;
    }>(
      `select id, profile_id, movie_id, action, source, session_id, occurred_at, reverses_id, strength
       from kino_events where user_id = $1 order by occurred_at asc`,
      [userId],
    );
    const listed = await sql.query<{ n: number }>(
      `select count(*)::int as n from kino_movie_state where user_id = $1`,
      [userId],
    );
    if ((listed[0]?.n ?? 0) === 0 && eventRows.length) {
      try {
        await rebuildMovieState(sql, userId);
      } catch {
        /* lists fill on the next mark */
      }
    }

    const kinds = new Set(["self", "partner", "kids", "other"]);

    const p = prefs[0];
    const letterboxd = connections.find((c) => c.kind === "letterboxd");
    const grok = connections.find((c) => c.kind === "grok");
    const gmail = connections.find((c) => c.kind === "gmail");
    const at =
      gmail?.at instanceof Date ? gmail.at.toISOString() : typeof gmail?.at === "string" ? gmail.at : undefined;

    return {
      payload: {
        prefsVersion: 6,
        events: eventRows.map((row) => ({ userId, ...toEvent(row) })),
        services: p?.services ?? [],
        profiles: profiles.length
          ? profiles.map((row) => ({
              id: row.id,
              name: row.name,
              kind: kinds.has(row.kind) ? row.kind : "other",
            }))
          : [{ id: "you", name: "You", kind: "self" }],
        activeProfileId: p?.active_profile_id ?? "you",
        pendingAsks: Array.isArray(p?.pending_asks) ? p.pending_asks : [],
        englishOnly: p?.english_only ?? true,
        spoilerSafe: p?.spoiler_safe ?? true,
        tonight: p?.tonight ?? null,
        letterboxdUser: letterboxd?.handle ?? "",
        gmail: {
          grok: grok?.status ?? "unknown",
          scan: gmail?.status ?? "idle",
          count: gmail?.count ?? 0,
          total: gmail?.total ?? 0,
          message: gmail?.message || "Not checked yet.",
          ...(at ? { at } : {}),
        },
        handle: page?.handle ?? "",
        handlePublic: page?.public ?? true,
        tune: {
          streamingOnly: p?.streaming_only ?? false,
          preferFresh: p?.prefer_fresh ?? false,
          shortOnly: p?.short_only ?? false,
          familySafe: p?.family_safe ?? false,
          criticsFirst: p?.critics_first ?? false,
          wildcards: p?.wildcards ?? true,
          era: p?.era ?? "any",
        },
      },
    };
  });

export const pushKinoState = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ payload: PrefsPayload }).parse(input))
  .handler(async ({ context, data }) => {
    if (!rateLimit(`push:${context.userId}`, 80, 60_000)) {
      return { ok: false as const, error: "rate_limited" };
    }
    const sql = await getSql();
    await upsertPrefs(sql, context.userId, data.payload);
    if (data.payload.events?.length) await insertEvents(sql, context.userId, data.payload.events);
    return { ok: true as const };
  });

export const pushKinoEvents = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ events: z.array(EventRow).max(400) }).parse(input))
  .handler(async ({ context, data }) => {
    if (!rateLimit(`events:${context.userId}`, 80, 60_000)) {
      return { ok: false as const, count: 0, error: "rate_limited" };
    }
    const sql = await getSql();
    await insertEvents(sql, context.userId, data.events);
    return { ok: true as const, count: data.events.length };
  });
