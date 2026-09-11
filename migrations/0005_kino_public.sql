create table if not exists kino_handle (
  handle text primary key,
  user_id text not null unique references "user" ("id") on delete cascade,
  public boolean not null default true,
  display_name text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kino_handle_user_idx on kino_handle (user_id);
create index if not exists kino_events_occurred_idx on kino_events (occurred_at desc);

create table if not exists kino_stat (
  key text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists kino_stat_hourly (
  hour timestamptz not null,
  action text not null,
  count integer not null default 0,
  primary key (hour, action)
);

insert into kino_stat (key, value)
select 'events', count(*) from kino_events
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into kino_stat (key, value)
select action, count(*) from kino_events group by action
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into kino_stat_hourly (hour, action, count)
select date_trunc('hour', occurred_at), action, count(*)::int
from kino_events
group by 1, 2
on conflict (hour, action) do update set count = excluded.count;
