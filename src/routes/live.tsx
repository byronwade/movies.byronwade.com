import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { pullLiveStats } from "@/lib/server/public";
import { MOVIE_BY_ID, MOVIES } from "@/catalog/movies";
import { StillImage } from "@/components/movie/still";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/live")({ component: Live });

type LiveStats = Awaited<ReturnType<typeof pullLiveStats>>;

const ACTION_LABEL: Record<string, string> = {
  save: "saved",
  favorite: "hearted",
  seen: "watched",
  skip: "skipped",
  interested: "marked interested",
  not_interested: "passed",
  trailer_started: "played a trailer",
  import_seen: "imported",
  linger: "lingered",
  impression: "saw",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 8) return "now";
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

function Live() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    const load = () => {
      if (document.visibilityState === "hidden") return;
      void pullLiveStats({ data: {} })
        .then((s) => {
          if (!live) return;
          setStats(s);
          setErr("");
        })
        .catch(() => {
          if (!live) return;
          setErr("Couldn’t reach the board.");
        });
    };
    load();
    const t = window.setInterval(load, 4000);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      live = false;
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const maxHour = Math.max(1, ...(stats?.hours.map((h) => h.count) ?? [1]));

  return (
    <AppShell>
      <Workbench wide>
        <div className="live-board">
          <header className="live-hero">
            <p className="live-kicker">
              <span className={cn("live-dot", stats && stats.pulse > 0 && "is-on")} />
              Live
            </p>
            <h1 className="type-display">movies, in motion</h1>
            <p className="mt-2 max-w-xl type-content text-body">
              Every save, heart, and skip across the service. Catalog of {fmt(MOVIES.length)}. Updates every few seconds.
            </p>
          </header>

          {err ? <p className="mt-6 type-content text-body">{err}</p> : null}

          <ul className="live-tiles">
            <Tile label="In the last 5 min" value={fmt(stats?.pulse ?? 0)} hint="marks right now" pulse />
            <Tile label="Last 24 hours" value={fmt(stats?.today ?? 0)} hint="across everyone" />
            <Tile label="All marks" value={fmt(stats?.events ?? 0)} hint="since the first save" />
            <Tile label="People" value={fmt(stats?.people ?? 0)} hint="signed-in" />
            <Tile label="Saved" value={fmt(stats?.saves ?? 0)} hint="watch later" />
            <Tile label="Favorites" value={fmt(stats?.favorites ?? 0)} hint="the ones they keep" />
            <Tile label="Watched" value={fmt(stats?.seen ?? 0)} hint="marked seen" />
            <Tile label="Public pages" value={fmt(stats?.publicPages ?? 0)} hint={`${stats?.pages ?? 0} usernames`} />
          </ul>

          <section className="live-panel">
            <div className="flex items-end justify-between gap-3">
              <h2 className="type-section">Last 24 hours</h2>
              <p className="font-mono type-caption text-marker">{fmt(stats?.today ?? 0)} marks</p>
            </div>
            <div className="live-spark" aria-hidden>
              {(stats?.hours.length ? stats.hours : Array.from({ length: 24 }, (_, i) => ({ hour: String(i), count: 0 }))).map((h) => (
                <span key={h.hour} className="live-bar" style={{ height: `${Math.max(6, (h.count / maxHour) * 100)}%` }} />
              ))}
            </div>
          </section>

          <div className="live-split">
            <section className="live-panel">
              <h2 className="type-section">Right now</h2>
              <ol className="live-ticks">
                {(stats?.ticks ?? []).map((t, i) => {
                  const movie = MOVIE_BY_ID[t.movieId];
                  return (
                    <li key={`${t.at}-${i}`}>
                      <span className="live-tick-time">{ago(t.at)}</span>
                      <span>
                        Someone {ACTION_LABEL[t.action] ?? t.action}
                        {movie ? ` ${movie.title}` : ""}
                      </span>
                    </li>
                  );
                })}
                {!stats?.ticks.length ? <li className="text-body">Waiting on the next mark.</li> : null}
              </ol>
            </section>
            <section className="live-panel">
              <h2 className="type-section">Today’s mix</h2>
              <ul className="live-mix">
                {(stats?.mix ?? []).map((m) => (
                  <li key={m.action}>
                    <span>{ACTION_LABEL[m.action] ?? m.action}</span>
                    <span className="font-mono">{fmt(m.n)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="live-panel">
            <h2 className="type-section">This week</h2>
            <p className="mt-1 mb-4 type-caption text-body">Films people saved, hearted, or watched.</p>
            <ul className="live-posters">
              {(stats?.top ?? []).map((row) => {
                const movie = MOVIE_BY_ID[row.movieId];
                if (!movie) return null;
                return (
                  <li key={row.movieId}>
                    <Link to="/movie/$slug" params={{ slug: movie.slug }} className="press block">
                      <StillImage slug={movie.slug} atmosphere={movie.atmosphere} title={movie.title} className="poster-still" />
                      <span className="poster-name">{movie.title}</span>
                      <span className="poster-meta">{fmt(row.n)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </Workbench>
    </AppShell>
  );
}

function Tile({
  label,
  value,
  hint,
  pulse,
}: {
  label: string;
  value: string;
  hint: string;
  pulse?: boolean;
}) {
  return (
    <li className={cn("live-tile", pulse && "is-pulse")}>
      <p className="live-tile-label">{label}</p>
      <p className="live-tile-value">{value}</p>
      <p className="live-tile-hint">{hint}</p>
    </li>
  );
}
