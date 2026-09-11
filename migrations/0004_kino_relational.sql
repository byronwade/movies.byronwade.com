-- Relational KINO schema. Event log stays the source of truth; prefs, household
-- profiles, connections, and derived list flags live in columns so they can be
-- queried without unpacking kino_state.payload.

create table if not exists kino_prefs (
  user_id text primary key references "user" ("id") on delete cascade,
  english_only boolean not null default true,
  spoiler_safe boolean not null default true,
  era text not null default 'any',
  streaming_only boolean not null default false,
  prefer_fresh boolean not null default false,
  short_only boolean not null default false,
  family_safe boolean not null default false,
  critics_first boolean not null default false,
  wildcards boolean not null default true,
  services text[] not null default '{}',
  active_profile_id text not null default 'you',
  tonight jsonb,
  pending_asks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists kino_profile (
  id text not null,
  user_id text not null references "user" ("id") on delete cascade,
  name text not null,
  kind text not null default 'self',
  primary key (user_id, id)
);

create table if not exists kino_connection (
  user_id text not null references "user" ("id") on delete cascade,
  kind text not null,
  status text not null default 'unknown',
  handle text not null default '',
  count integer not null default 0,
  total integer not null default 0,
  message text not null default '',
  at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

create table if not exists kino_movie_state (
  user_id text not null references "user" ("id") on delete cascade,
  profile_id text not null,
  movie_id text not null,
  seen boolean not null default false,
  saved boolean not null default false,
  favorited boolean not null default false,
  interested boolean not null default false,
  not_interested boolean not null default false,
  never_show_again boolean not null default false,
  skip_count integer not null default 0,
  impression_count integer not null default 0,
  last_skipped_at timestamptz,
  last_impression_at timestamptz,
  sentiment text,
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_id, movie_id)
);

create index if not exists kino_movie_state_saved_idx
  on kino_movie_state (user_id, profile_id) where saved;
create index if not exists kino_movie_state_fav_idx
  on kino_movie_state (user_id, profile_id) where favorited;
create index if not exists kino_movie_state_interested_idx
  on kino_movie_state (user_id, profile_id) where interested;
create index if not exists kino_movie_state_seen_idx
  on kino_movie_state (user_id, profile_id) where seen;
create index if not exists kino_movie_state_hidden_idx
  on kino_movie_state (user_id, profile_id) where not_interested;
create index if not exists kino_events_user_movie_idx
  on kino_events (user_id, profile_id, movie_id);

-- Copy leftover blob events into the log.
insert into kino_events (id, user_id, profile_id, movie_id, action, source, session_id, occurred_at, reverses_id, strength)
select
  e->>'id',
  s.user_id,
  coalesce(nullif(e->>'profileId', ''), 'you'),
  coalesce(e->>'entityId', e->>'movieId'),
  e->>'action',
  coalesce(nullif(e->>'source', ''), 'feed'),
  coalesce(e->>'sessionId', ''),
  coalesce((e->>'occurredAt')::timestamptz, now()),
  nullif(e->>'reversesId', ''),
  nullif(e->>'strength', '')::real
from kino_state s
join "user" u on u.id = s.user_id
cross join lateral jsonb_array_elements(coalesce(s.payload->'events', '[]'::jsonb)) e
where coalesce(e->>'id', '') <> ''
  and coalesce(e->>'entityId', e->>'movieId', '') <> ''
  and coalesce(e->>'action', '') <> ''
on conflict (id) do nothing;

insert into kino_prefs (
  user_id, english_only, spoiler_safe, era, streaming_only, prefer_fresh, short_only,
  family_safe, critics_first, wildcards, services, active_profile_id, tonight, pending_asks
)
select
  s.user_id,
  coalesce((s.payload->>'englishOnly')::boolean, true),
  coalesce((s.payload->>'spoilerSafe')::boolean, true),
  coalesce(nullif(s.payload->'tune'->>'era', ''), 'any'),
  coalesce((s.payload->'tune'->>'streamingOnly')::boolean, false),
  coalesce((s.payload->'tune'->>'preferFresh')::boolean, false),
  coalesce((s.payload->'tune'->>'shortOnly')::boolean, false),
  coalesce((s.payload->'tune'->>'familySafe')::boolean, false),
  coalesce((s.payload->'tune'->>'criticsFirst')::boolean, false),
  coalesce((s.payload->'tune'->>'wildcards')::boolean, true),
  coalesce(
    (select array_agg(x) from jsonb_array_elements_text(coalesce(s.payload->'services', '[]'::jsonb)) as x),
    '{}'
  ),
  coalesce(nullif(s.payload->>'activeProfileId', ''), 'you'),
  s.payload->'tonight',
  coalesce(s.payload->'pendingAsks', '[]'::jsonb)
from kino_state s
join "user" u on u.id = s.user_id
on conflict (user_id) do nothing;

insert into kino_profile (id, user_id, name, kind)
select
  coalesce(nullif(p->>'id', ''), 'you'),
  s.user_id,
  coalesce(nullif(p->>'name', ''), 'You'),
  coalesce(nullif(p->>'kind', ''), 'self')
from kino_state s
join "user" u on u.id = s.user_id
cross join lateral jsonb_array_elements(coalesce(s.payload->'profiles', '[]'::jsonb)) p
on conflict (user_id, id) do nothing;

insert into kino_connection (user_id, kind, status, handle, count, total, message, at)
select
  s.user_id,
  'letterboxd',
  case when coalesce(s.payload->>'letterboxdUser', '') = '' then 'unknown' else 'connected' end,
  coalesce(s.payload->>'letterboxdUser', ''),
  0,
  0,
  '',
  null
from kino_state s
join "user" u on u.id = s.user_id
on conflict (user_id, kind) do nothing;

insert into kino_connection (user_id, kind, status, handle, count, total, message, at)
select
  s.user_id,
  'grok',
  coalesce(nullif(s.payload->'gmail'->>'grok', ''), 'unknown'),
  '',
  0,
  0,
  '',
  case
    when coalesce(s.payload->'gmail'->>'at', '') ~ '^[0-9]{4}-' then (s.payload->'gmail'->>'at')::timestamptz
    else null
  end
from kino_state s
join "user" u on u.id = s.user_id
on conflict (user_id, kind) do nothing;

insert into kino_connection (user_id, kind, status, handle, count, total, message, at)
select
  s.user_id,
  'gmail',
  coalesce(nullif(s.payload->'gmail'->>'scan', ''), 'idle'),
  '',
  coalesce((s.payload->'gmail'->>'count')::int, 0),
  coalesce((s.payload->'gmail'->>'total')::int, 0),
  coalesce(s.payload->'gmail'->>'message', ''),
  case
    when coalesce(s.payload->'gmail'->>'at', '') ~ '^[0-9]{4}-' then (s.payload->'gmail'->>'at')::timestamptz
    else null
  end
from kino_state s
join "user" u on u.id = s.user_id
on conflict (user_id, kind) do nothing;
