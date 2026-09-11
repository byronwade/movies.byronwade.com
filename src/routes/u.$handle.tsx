import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { PosterGrid } from "@/components/movie/poster-grid";
import { pullPublicProfile } from "@/lib/server/public";
import { collisionPath, handlePath, handleUrl, splitHandles } from "@/lib/handle";
import { optionalShelf, type ShelfTab } from "@/lib/shelves";
import { MOVIE_BY_ID, MOVIE_BY_SLUG } from "@/catalog/movies";
import type { Movie } from "@/catalog/types";
import { collideRank, genreBadges, rankShelf } from "@/tasterank";
import { listFavorites, listInterested, listPassed, listSaved, listWatched, useKino } from "@/lib/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/u/$handle")({
  validateSearch: (search: Record<string, unknown>) => optionalShelf(search),
  loader: async ({ params }) => {
    try {
      return await pullPublicProfile({ data: { handle: params.handle } });
    } catch {
      return { missing: true as const };
    }
  },
  component: PublicTaste,
});

type PublicPayload = Awaited<ReturnType<typeof pullPublicProfile>>;

function moviesOf(ids: string[] | undefined): Movie[] {
  const seen = new Set<string>();
  const out: Movie[] = [];
  for (const id of ids ?? []) {
    const movie = MOVIE_BY_ID[id] ?? MOVIE_BY_SLUG[id];
    if (!movie || seen.has(movie.id)) continue;
    seen.add(movie.id);
    out.push(movie);
  }
  return out;
}

function mergeIds(remote: string[] | undefined, local: Movie[]) {
  return moviesOf([...(remote ?? []), ...local.map((m) => m.id)]);
}

function PublicTaste() {
  const { handle: raw } = Route.useParams();
  const parts = splitHandles(raw);
  if (parts.length >= 2) return <Collision a={parts[0]!} b={parts[1]!} />;
  return <OneHandle handle={parts[0] ?? ""} />;
}

function usePublic(handle: string) {
  const [data, setData] = useState<PublicPayload | null>(null);
  useEffect(() => {
    let live = true;
    setData(null);
    if (!handle) return;
    void pullPublicProfile({ data: { handle } })
      .then((d) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setData({ missing: true });
      });
    return () => {
      live = false;
    };
  }, [handle]);
  return data;
}

function Collision({ a, b }: { a: string; b: string }) {
  const left = usePublic(a);
  const right = usePublic(b);
  const recs = useMemo(() => {
    if (!left || left.missing || left.private || !right || right.missing || right.private) return [];
    return collideRank(
      { handle: left.handle, name: left.name, favorites: left.favorites, saved: left.saved, interested: left.interested, seen: left.seen, passed: left.passed },
      { handle: right.handle, name: right.name, favorites: right.favorites, saved: right.saved, interested: right.interested, seen: right.seen, passed: right.passed },
    );
  }, [left, right]);

  if (!left || !right) {
    return (
      <AppShell>
        <Workbench title={`@${a} + @${b}`} />
      </AppShell>
    );
  }

  const blocked = [left, right].find((d) => d.missing || d.private);
  return (
    <AppShell>
      <Workbench title={`@${a} + @${b}`} wide>
        <header className="pb-6">
          <p className="font-mono type-caption text-marker">{handleUrl(`${a}+${b}`)}</p>
          <h1 className="mt-1 type-page">Tonight for both</h1>
          <p className="mt-2 max-w-xl type-content text-body">
            Loves of either, vetoes of either. A sitting two people can actually share.
          </p>
        </header>
        {blocked?.missing ? (
          <p className="type-content text-body">One of those usernames isn’t claimed.</p>
        ) : blocked?.private ? (
          <p className="type-content text-body">One of these tastes is private.</p>
        ) : recs.length ? (
          <PosterGrid movies={recs.map((r) => r.movie)} />
        ) : (
          <p className="type-content text-body">Not enough overlap yet. Heart a few more films.</p>
        )}
      </Workbench>
    </AppShell>
  );
}

function OneHandle({ handle }: { handle: string }) {
  const data = Route.useLoaderData();
  const mine = useKino((s) => s.handle);
  const signedIn = useKino((s) => s.signedIn);
  const claimHandle = useKino((s) => s.claimHandle);
  const movieState = useKino((s) => s.movieState);
  const taste = useKino((s) => s.taste);
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [other, setOther] = useState("");

  if (!data) {
    return (
      <AppShell>
        <Workbench title={`@${handle}`} />
      </AppShell>
    );
  }

  if (data.missing && mine !== handle) {
    return (
      <AppShell>
        <Workbench title={`@${handle}`}>
          <p className="type-page">@{handle}</p>
          <p className="mt-2 type-content text-body">
            {signedIn ? "This username isn’t claimed yet. Take it and your lists go live here." : "That username isn’t claimed yet."}
          </p>
          {signedIn ? (
            <button
              type="button"
              className="press commit mt-6 inline-flex h-11 items-center rounded-full px-5 type-chrome"
              onClick={() => {
                void claimHandle(handle).then((res) => {
                  if (res.ok) window.location.assign(`/u/${handle}`);
                });
              }}
            >
              Claim @{handle}
            </button>
          ) : (
            <Link to="/login" className="mt-6 inline-block type-chrome text-accent">
              Sign in to claim it
            </Link>
          )}
        </Workbench>
      </AppShell>
    );
  }

  if (data.private && mine !== handle) {
    return (
      <AppShell>
        <Workbench title={`@${data.handle}`}>
          <p className="type-page">@{data.handle}</p>
          <p className="mt-2 type-content text-body">This taste is private.</p>
        </Workbench>
      </AppShell>
    );
  }

  const owner = Boolean(mine === handle || (!data.missing && !data.private && data.owner));
  const pageHandle = data.missing ? handle : data.handle;
  const pageName = data.missing ? handle : data.name;
  const pageBio = data.missing || data.private ? "" : data.bio;
  const pageSince = data.missing || data.private ? null : data.since;
  const remote = data.missing || data.private
    ? { favorites: [] as string[], saved: [] as string[], interested: [] as string[], seen: [] as string[], passed: [] as string[], counts: { favorited: 0, saved: 0, interested: 0, seen: 0, passed: 0 } }
    : data;
  const shelfOf = (ids: string[] | undefined, local: ReturnType<typeof listFavorites>) => {
    const movies = owner ? mergeIds(ids, local) : moviesOf(ids);
    return owner ? rankShelf(movies, { taste, movieState }) : movies;
  };
  const shelves: Record<Exclude<ShelfTab, "passed">, { label: string; movies: Movie[]; n: number }> = {
    favorites: {
      label: "Favorites",
      movies: shelfOf(remote.favorites, listFavorites(movieState)),
      n: remote.counts.favorited,
    },
    later: {
      label: "Later",
      movies: shelfOf(remote.saved, listSaved(movieState)),
      n: remote.counts.saved,
    },
    interested: {
      label: "Interested",
      movies: shelfOf(remote.interested, listInterested(movieState)),
      n: remote.counts.interested,
    },
    watched: {
      label: "Watched",
      movies: shelfOf(remote.seen, listWatched(movieState)),
      n: remote.counts.seen,
    },
  };
  const since = pageSince ? new Date(pageSince).getFullYear() : null;
  const loves = genreBadges(
    (owner ? shelves.favorites.movies.map((m) => m.id) : remote.favorites) ?? [],
    3,
  );
  const vetoes = genreBadges(owner ? listPassed(movieState).map((m) => m.id) : remote.passed, 4);
  const collideTo = mine && mine !== pageHandle ? collisionPath(mine, pageHandle) : null;
  const shelfKey: keyof typeof shelves = tab && tab !== "passed" ? tab : "favorites";
  const displayShelf = shelves[shelfKey].movies.length
    ? shelfKey
    : ((Object.keys(shelves) as Array<keyof typeof shelves>).find((id) => shelves[id].movies.length) ?? shelfKey);
  const shown = shelves[displayShelf];

  return (
    <AppShell>
      <Workbench
        title={`@${pageHandle}`}
        trailing={
          owner ? (
            <Link to="/profile" className="type-chrome text-accent">
              Edit
            </Link>
          ) : (
            <Link to="/live" className="type-chrome text-accent">
              Live
            </Link>
          )
        }
        wide
      >
        <header className="pb-6">
          <p className="font-mono type-caption text-marker">{handleUrl(pageHandle)}</p>
          <h1 className="mt-1 type-page">{pageName}</h1>
          {pageBio ? <p className="mt-2 max-w-xl type-content text-body">{pageBio}</p> : null}
          {owner && data.missing ? (
            <p className="mt-2 type-caption text-body">This page is on this device. Claim @{pageHandle} on Account to publish it.</p>
          ) : null}
          <p className="mt-3 type-caption text-body">
            {Math.max(remote.counts.favorited, shelves.favorites.movies.length)} favorites · {Math.max(remote.counts.saved, shelves.later.movies.length)} later · {Math.max(remote.counts.seen, shelves.watched.movies.length)} watched
            {since ? ` · since ${since}` : ""}
          </p>
          {loves.length ? (
            <p className="mt-4 type-caption text-body">
              <span className="text-marker">Keeps close </span>
              {loves.join(" · ")}
            </p>
          ) : null}
          {vetoes.length ? (
            <p className="mt-1 type-caption text-body">
              <span className="text-marker">Won’t sit through </span>
              {vetoes.join(" · ")}
            </p>
          ) : null}
          {collideTo ? (
            <a href={collideTo} className="mt-5 inline-flex h-10 items-center rounded-full px-4 commit type-chrome">
              Watch with them
            </a>
          ) : owner ? null : (
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!other) return;
                window.location.assign(collisionPath(other, pageHandle));
              }}
            >
              <input
                value={other}
                onChange={(e) => setOther(e.target.value.replace(/^@/, ""))}
                placeholder="Your @ to collide"
                className="well h-10 min-w-0 flex-1 rounded-full px-3 type-caption"
              />
              <button type="submit" className="press h-10 shrink-0 rounded-full px-4 commit type-chrome">
                Collide
              </button>
            </form>
          )}
        </header>
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {(Object.keys(shelves) as Array<keyof typeof shelves>).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => void navigate({ search: { tab: id } })}
              className={cn("press h-8 shrink-0 rounded-full px-3 type-chrome", displayShelf === id ? "commit" : "well")}
            >
              {shelves[id].label}
              {shelves[id].movies.length ? ` · ${shelves[id].movies.length}` : ""}
            </button>
          ))}
        </div>
        {shown.movies.length ? (
          <div className="mt-4">
            <PosterGrid movies={shown.movies} />
          </div>
        ) : (
          <p className="pt-8 type-content text-body">Nothing on this shelf yet.</p>
        )}
        <p className="mt-8 type-caption text-marker">{handlePath(pageHandle)}</p>
      </Workbench>
    </AppShell>
  );
}
