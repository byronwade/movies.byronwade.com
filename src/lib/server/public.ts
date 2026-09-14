import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { handleError, normalizeHandle, suggestedHandle } from "@/lib/handle";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSessionUser } from "@/lib/auth/verify.server";

const optionalAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const user = await getSessionUser(context.bearerToken);
    return next({ context: { userId: user?.id ?? null } });
  });

function iso(v: string | Date | null | undefined) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : String(v);
}

export async function ensureUserHandle(sql: { query: <T>(text: string, params?: unknown[]) => Promise<T[]> }, userId: string) {
  const existing = await sql.query<{ handle: string; public: boolean }>(
    `select handle, public from kino_handle where user_id = $1 limit 1`,
    [userId],
  );
  if (existing[0]) return existing[0];
  const user = await sql.query<{ name: string | null }>(`select name from "user" where id = $1`, [userId]);
  const guess = suggestedHandle(user[0]?.name ?? "");
  if (!guess) return null;
  const taken = await sql.query<{ user_id: string }>(`select user_id from kino_handle where handle = $1 limit 1`, [guess]);
  if (taken[0]) return null;
  await sql.query(
    `insert into kino_handle (handle, user_id, public, display_name, bio, updated_at)
     values ($1, $2, true, $3, '', now())
     on conflict (handle) do nothing`,
    [guess, userId, user[0]?.name ?? guess],
  );
  const again = await sql.query<{ handle: string; public: boolean }>(
    `select handle, public from kino_handle where user_id = $1 limit 1`,
    [userId],
  );
  return again[0] ?? null;
}

export const pullLiveStats = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async () => {
  const sql = await getSql();
  const totals = await sql.query<{ key: string; value: number }>(`select key, value from kino_stat`);
  const byKey: Record<string, number> = {};
  for (const row of totals) byKey[row.key] = Number(row.value) || 0;

  const people = await sql.query<{ n: number }>(`select count(*)::int as n from "user"`);
  const pages = await sql.query<{ n: number; public: number }>(
    `select count(*)::int as n, count(*) filter (where public)::int as public from kino_handle`,
  );
  const pulse = await sql.query<{ n: number }>(
    `select count(*)::int as n from kino_events where occurred_at > now() - interval '5 minutes'`,
  );
  const today = await sql.query<{ n: number }>(
    `select count(*)::int as n from kino_events where occurred_at > now() - interval '24 hours'`,
  );
  const hourly = await sql.query<{ hour: string | Date; count: number }>(
    `select hour, sum(count)::int as count
     from kino_stat_hourly
     where hour > now() - interval '24 hours'
     group by hour
     order by hour asc`,
  );
  const mix = await sql.query<{ action: string; n: number }>(
    `select action, count(*)::int as n
     from kino_events
     where occurred_at > now() - interval '24 hours'
     group by action
     order by n desc
     limit 12`,
  );
  const top = await sql.query<{ movie_id: string; n: number }>(
    `select movie_id, count(*)::int as n
     from kino_events
     where action in ('save','favorite','interested','seen')
       and occurred_at > now() - interval '7 days'
     group by movie_id
     order by n desc
     limit 12`,
  );
  const ticks = await sql.query<{ action: string; movie_id: string; occurred_at: string | Date }>(
    `select action, movie_id, occurred_at
     from kino_events
     where action in ('save','favorite','seen','skip','interested','trailer_started')
     order by occurred_at desc
     limit 18`,
  );

  const hours = hourly.map((row) => ({
    hour: iso(row.hour) ?? "",
    count: Number(row.count) || 0,
  }));

  return {
    people: people[0]?.n ?? 0,
    pages: pages[0]?.n ?? 0,
    publicPages: pages[0]?.public ?? 0,
    pulse: pulse[0]?.n ?? 0,
    today: today[0]?.n ?? 0,
    events: byKey.events ?? 0,
    saves: byKey.save ?? 0,
    favorites: byKey.favorite ?? 0,
    seen: (byKey.seen ?? 0) + (byKey.import_seen ?? 0),
    skips: byKey.skip ?? 0,
    interested: byKey.interested ?? 0,
    trailers: byKey.trailer_started ?? 0,
    hours,
    mix: mix.map((row) => ({ action: row.action, n: row.n })),
    top: top.map((row) => ({ movieId: row.movie_id, n: row.n })),
    ticks: ticks.map((row) => ({
      action: row.action,
      movieId: row.movie_id,
      at: iso(row.occurred_at) ?? "",
    })),
    at: new Date().toISOString(),
  };
});

export const pullPublicProfile = createServerFn({ method: "POST" })
  .middleware([optionalAuth])
  .validator((input: unknown) => z.object({ handle: z.string().max(32) }).parse(input))
  .handler(async ({ data, context }) => {
    try {
    const handle = normalizeHandle(data.handle);
    if (handleError(handle)) return { missing: true as const };
    const sql = await getSql();
    const rows = await sql.query<{
      handle: string;
      user_id: string;
      public: boolean;
      display_name: string | null;
      bio: string;
      created_at: string | Date;
    }>(
      `select handle, user_id, public, display_name, bio, created_at from kino_handle where handle = $1 limit 1`,
      [handle],
    );
    const row = rows[0];
    if (!row) return { missing: true as const };
    const owner = context.userId === row.user_id;
    if (!row.public && !owner) {
      return {
        missing: false as const,
        private: true as const,
        handle: row.handle,
        name: row.display_name || row.handle,
        since: iso(row.created_at),
      };
    }

    const flags = await sql.query<{
      movie_id: string;
      saved: boolean;
      favorited: boolean;
      interested: boolean;
      seen: boolean;
      not_interested: boolean;
    }>(
      `select movie_id,
              bool_or(saved) as saved,
              bool_or(favorited) as favorited,
              bool_or(interested) as interested,
              bool_or(seen) as seen,
              bool_or(not_interested) as not_interested
       from kino_movie_state
       where user_id = $1 and (saved or favorited or interested or seen or not_interested)
       group by movie_id
       order by max(updated_at) desc
       limit 800`,
      [row.user_id],
    );
    let listed = flags;
    if (!listed.length) {
      const events = await sql.query<{ movie_id: string; action: string }>(
        `select movie_id, action
         from kino_events
         where user_id = $1
           and action in (
             'save','unsave','favorite','unfavorite','interested','uninterested',
             'seen','unseen','import_seen','import_watchlist','not_interested','show_again','love','like'
           )
         order by occurred_at asc`,
        [row.user_id],
      );
      const map = new Map<string, (typeof flags)[number]>();
      for (const e of events) {
        const cur = map.get(e.movie_id) ?? {
          movie_id: e.movie_id,
          saved: false,
          favorited: false,
          interested: false,
          seen: false,
          not_interested: false,
        };
        if (e.action === "save" || e.action === "import_watchlist") cur.saved = true;
        if (e.action === "unsave") cur.saved = false;
        if (e.action === "favorite") cur.favorited = true;
        if (e.action === "unfavorite") cur.favorited = false;
        if (e.action === "interested") cur.interested = true;
        if (e.action === "uninterested") cur.interested = false;
        if (e.action === "seen" || e.action === "import_seen" || e.action === "love" || e.action === "like") cur.seen = true;
        if (e.action === "unseen") cur.seen = false;
        if (e.action === "not_interested") {
          cur.not_interested = true;
          cur.saved = false;
          cur.favorited = false;
          cur.interested = false;
        }
        if (e.action === "show_again") cur.not_interested = false;
        map.set(e.movie_id, cur);
      }
      listed = [...map.values()].filter((f) => f.saved || f.favorited || f.interested || f.seen || f.not_interested);
    }
    const counts = await sql.query<{
      saved: number;
      favorited: number;
      interested: number;
      seen: number;
      passed: number;
    }>(
      `select
         count(*) filter (where saved)::int as saved,
         count(*) filter (where favorited)::int as favorited,
         count(*) filter (where interested)::int as interested,
         count(*) filter (where seen)::int as seen,
         count(*) filter (where not_interested)::int as passed
       from (
         select bool_or(saved) as saved,
                bool_or(favorited) as favorited,
                bool_or(interested) as interested,
                bool_or(seen) as seen,
                bool_or(not_interested) as not_interested
         from kino_movie_state
         where user_id = $1
         group by movie_id
       ) s`,
      [row.user_id],
    );

    const fromFlags = {
      saved: listed.filter((f) => f.saved).map((f) => f.movie_id),
      favorites: listed.filter((f) => f.favorited).map((f) => f.movie_id),
      interested: listed.filter((f) => f.interested).map((f) => f.movie_id),
      seen: listed.filter((f) => f.seen).map((f) => f.movie_id),
      passed: listed.filter((f) => f.not_interested).map((f) => f.movie_id),
    };
    const n = (ids: string[]) => ids.length;

    return {
      missing: false as const,
      private: false as const,
      handle: row.handle,
      name: row.display_name || row.handle,
      bio: row.bio,
      since: iso(row.created_at),
      owner,
      counts: {
        saved: Math.max(counts[0]?.saved ?? 0, n(fromFlags.saved)),
        favorited: Math.max(counts[0]?.favorited ?? 0, n(fromFlags.favorites)),
        interested: Math.max(counts[0]?.interested ?? 0, n(fromFlags.interested)),
        seen: Math.max(counts[0]?.seen ?? 0, n(fromFlags.seen)),
        passed: Math.max(counts[0]?.passed ?? 0, n(fromFlags.passed)),
      },
      ...fromFlags,
    };
    } catch (err) {
      console.error("[public] pullPublicProfile failed", err);
      return { missing: false as const, error: true as const };
    }
  });

export const claimHandle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ handle: z.string().max(32), public: z.boolean().optional(), bio: z.string().max(160).optional() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const handle = normalizeHandle(data.handle);
    const err = handleError(handle);
    if (err) return { ok: false as const, error: err };
    const sql = await getSql();
    const taken = await sql.query<{ user_id: string }>(
      `select user_id from kino_handle where handle = $1 limit 1`,
      [handle],
    );
    if (taken[0] && taken[0].user_id !== context.userId) {
      return { ok: false as const, error: "Taken." };
    }
    const mine = await sql.query<{ handle: string }>(
      `select handle from kino_handle where user_id = $1 limit 1`,
      [context.userId],
    );
    if (mine[0] && mine[0].handle !== handle) {
      await sql.query(`delete from kino_handle where user_id = $1`, [context.userId]);
    }
    const name = await sql.query<{ name: string }>(`select name from "user" where id = $1`, [context.userId]);
    await sql.query(
      `insert into kino_handle (handle, user_id, public, display_name, bio, updated_at)
       values ($1, $2, coalesce($3, true), $4, coalesce($5, ''), now())
       on conflict (handle) do update set
         public = coalesce($3, kino_handle.public),
         display_name = excluded.display_name,
         bio = case when $5 is null then kino_handle.bio else excluded.bio end,
         updated_at = now()`,
      [handle, context.userId, data.public ?? null, name[0]?.name ?? handle, data.bio ?? null],
    );
    return { ok: true as const, handle };
  });

export const setHandlePublic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ public: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query(
      `update kino_handle set public = $2, updated_at = now() where user_id = $1 returning handle`,
      [context.userId, data.public],
    );
    if (!rows.length) return { ok: false as const, error: "Claim a username first." };
    return { ok: true as const };
  });

export async function bumpStats(sql: Awaited<ReturnType<typeof getSql>>, actions: string[]) {
  if (!actions.length) return;
  const counts = new Map<string, number>();
  for (const a of actions) counts.set(a, (counts.get(a) ?? 0) + 1);
  const rows = [...counts.entries()].map(([action, count]) => ({ action, count }));
  await sql.query(
    `insert into kino_stat (key, value, updated_at)
     values ('events', $1, now())
     on conflict (key) do update set value = kino_stat.value + excluded.value, updated_at = now()`,
    [actions.length],
  );
  await sql.query(
    `insert into kino_stat (key, value, updated_at)
     select x.action, x.count, now()
     from jsonb_to_recordset($1::jsonb) as x(action text, count int)
     on conflict (key) do update set value = kino_stat.value + excluded.value, updated_at = now()`,
    [JSON.stringify(rows)],
  );
  await sql.query(
    `insert into kino_stat_hourly (hour, action, count)
     select date_trunc('hour', now()), x.action, x.count
     from jsonb_to_recordset($1::jsonb) as x(action text, count int)
     on conflict (hour, action) do update set count = kino_stat_hourly.count + excluded.count`,
    [JSON.stringify(rows)],
  );
}
