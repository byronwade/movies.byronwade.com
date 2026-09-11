import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { PosterGrid } from "@/components/movie/poster-grid";
import { listFavorites, listInterested, listPassed, listSaved, listWatched, useKino } from "@/lib/store";
import { SHELF_TABS, optionalShelf, type ShelfTab } from "@/lib/shelves";
import { cn } from "@/lib/cn";
import type { Movie } from "@/catalog/types";

export const Route = createFileRoute("/saved")({
  validateSearch: (search: Record<string, unknown>) => optionalShelf(search),
  component: Saved,
});

const SHELVES: { id: ShelfTab; label: string }[] = [
  { id: "favorites", label: "Favorites" },
  { id: "interested", label: "Interested" },
  { id: "later", label: "Later" },
  { id: "watched", label: "Watched" },
  { id: "passed", label: "Not into" },
];

function Saved() {
  const movieState = useKino((s) => s.movieState);
  const taste = useKino((s) => s.taste);
  const signedIn = useKino((s) => s.signedIn);
  const record = useKino((s) => s.record);
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const ctx = { taste };
  const shelves: Record<ShelfTab, { movies: Movie[]; empty: string; remove: string; onRemove: (m: Movie) => void }> = {
    favorites: {
      movies: listFavorites(movieState, ctx),
      empty: "Heart a film if it’s one of yours.",
      remove: "Remove",
      onRemove: (m) => record("unfavorite", m.id, { label: "Removed from favorites" }),
    },
    interested: {
      movies: listInterested(movieState, ctx),
      empty: "Mark Interested on For you. Those films cycle back more often.",
      remove: "Remove",
      onRemove: (m) => record("uninterested", m.id, { label: "Removed from interested" }),
    },
    later: {
      movies: listSaved(movieState, ctx),
      empty: "Save a film to watch later.",
      remove: "Remove",
      onRemove: (m) => record("unsave", m.id, { label: "Removed" }),
    },
    watched: {
      movies: listWatched(movieState, ctx),
      empty: "Films you mark seen land here.",
      remove: "Unwatch",
      onRemove: (m) => record("unseen", m.id, { label: "Removed from watched" }),
    },
    passed: {
      movies: listPassed(movieState, ctx),
      empty: "Not into keeps a film out of For you.",
      remove: "Show again",
      onRemove: (m) => record("show_again", m.id, { label: "Showing again" }),
    },
  };
  const firstFilled = SHELVES.find((s) => shelves[s.id].movies.length)?.id ?? "later";
  const shelf = tab && SHELF_TABS.includes(tab) ? tab : firstFilled;
  useEffect(() => {
    if (tab) return;
    if (shelf === "later") return;
    void navigate({ search: { tab: shelf }, replace: true });
  }, [movieState, shelf, tab, navigate]);
  const active = shelves[shelf];
  const n = (id: ShelfTab) => shelves[id].movies.length;

  return (
    <AppShell>
      <Workbench title="Saved" wide>
        {!signedIn ? (
          <p className="mb-4 type-caption text-body">
            Marks stay on this device. Sign in to keep them on your account.
          </p>
        ) : null}
        <p className="mb-4 type-caption text-body">Most likely to watch first.</p>
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {SHELVES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => void navigate({ search: { tab: s.id } })}
              className={cn("press h-8 shrink-0 rounded-full px-3 type-chrome", shelf === s.id ? "commit" : "well")}
            >
              {s.label}
              <span className="ml-1.5 font-mono type-caption tabular-nums text-marker">{n(s.id)}</span>
            </button>
          ))}
        </div>
        {active.movies.length ? (
          <div className="mt-4">
            <PosterGrid movies={active.movies} onRemove={active.onRemove} removeLabel={active.remove} />
          </div>
        ) : (
          <p className="pt-8 type-content text-body">{active.empty}</p>
        )}
      </Workbench>
    </AppShell>
  );
}