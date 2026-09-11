create table if not exists kino_events (
  id text primary key,
  user_id text not null,
  profile_id text not null,
  movie_id text not null,
  action text not null,
  source text not null default 'feed',
  session_id text,
  occurred_at timestamptz not null,
  reverses_id text,
  strength real
);

create index if not exists kino_events_user_occurred on kino_events (user_id, occurred_at);
