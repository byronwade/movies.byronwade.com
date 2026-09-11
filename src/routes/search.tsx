import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { SearchField } from "@/components/chrome/ios";
import { PosterGrid, PosterRail } from "@/components/movie/poster-grid";
import { MOVIES } from "@/catalog/movies";
import { titleKey } from "@/catalog/title-key";
import { searchMovies } from "@/lib/search";
import { useKino } from "@/lib/store";
import type { Movie } from "@/catalog/types";

export const Route = createFileRoute("/search")({ component: SearchPage });

const RECENTS = "kino.search.recent";

function loadRecents(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENTS) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

function remember(q: string) {
  const next = [q, ...loadRecents().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  try {
    localStorage.setItem(RECENTS, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

function take(list: Movie[], n: number, used: Set<string>) {
  const out: Movie[] = [];
  for (const movie of list) {
    const key = titleKey(movie.title);
    if (used.has(movie.id) || used.has(key)) continue;
    used.add(movie.id);
    used.add(key);
    out.push(movie);
    if (out.length >= n) break;
  }
  return out;
}

function SearchPage() {
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const ranks = useKino((s) => s.ranks);
  const movieState = useKino((s) => s.movieState);
  const record = useKino((s) => s.record);
  const englishOnly = useKino((s) => s.englishOnly);
  const services = useKino((s) => s.services);
  const query = q.trim();
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const results = useMemo(() => (query ? searchMovies(MOVIES, query, 80) : []), [query]);
  const browse = useMemo(() => {
    const year = new Date().getFullYear();
    const pool = MOVIES.filter((m) => !movieState[m.id]?.notInterested && (!englishOnly || m.language === "en"));
    const byTaste = [...pool].sort(
      (a, b) => (ranks[b.id]?.tasteRank ?? b.popularity * 100) - (ranks[a.id]?.tasteRank ?? a.popularity * 100),
    );
    const used = new Set<string>();
    const yours = services.length
      ? take(
          byTaste.filter((m) => m.watch.some((w) => w.included && services.includes(w.provider))),
          16,
          used,
        )
      : [];
    const fresh = take(
      [...pool].filter((m) => m.year >= year - 1).sort((a, b) => b.popularity - a.popularity || b.year - a.year),
      16,
      used,
    );
    const acclaimed = take(
      [...pool]
        .filter((m) => (m.ratings?.rottenTomatoes ?? 0) >= 90 || m.quality >= 0.9)
        .sort((a, b) => (b.ratings?.rottenTomatoes ?? b.quality * 100) - (a.ratings?.rottenTomatoes ?? a.quality * 100)),
      16,
      used,
    );
    const forYou = take(byTaste, 16, used);
    return { yours, fresh, acclaimed, forYou };
  }, [movieState, englishOnly, ranks, services]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  useEffect(() => {
    if (query.length < 2) return;
    const t = window.setTimeout(() => setRecents(remember(query)), 700);
    return () => window.clearTimeout(t);
  }, [query]);

  return (
    <AppShell>
      <Workbench title="Search" wide>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Lord of the Rings, Nolan, LoTR…"
          autoFocus={!coarse}
        />
        {query ? (
          <>
            <p className="mt-3 type-caption text-marker">
              {results.length} match{results.length === 1 ? "" : "es"}
            </p>
            {results.length === 0 ? (
              <p className="pt-8 type-content text-body">Nothing for “{query}”. Try the full title, a director, or an actor.</p>
            ) : (
              <div className="mt-4">
                <PosterGrid
                  movies={results}
                  onOpen={(m) => {
                    if (query.length >= 2) record("search", m.id, { source: "search" });
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="pb-4">
            {recents.length ? (
              <div className="search-recents">
                {recents.map((r) => (
                  <button key={r} type="button" className="press feed-chip" onClick={() => setQ(r)}>
                    {r}
                  </button>
                ))}
              </div>
            ) : null}
            {browse.yours.length ? <PosterRail title="On your services" movies={browse.yours} /> : null}
            <PosterRail title="New" movies={browse.fresh} />
            <PosterRail title="Acclaimed" movies={browse.acclaimed} />
            <PosterRail title="For you" movies={browse.forYou} />
          </div>
        )}
      </Workbench>
    </AppShell>
  );
}
