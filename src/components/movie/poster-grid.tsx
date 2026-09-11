import { Link } from "@tanstack/react-router";
import { StillImage } from "@/components/movie/still";
import type { Movie } from "@/catalog/types";

export function PosterGrid({
  movies,
  onRemove,
  removeLabel = "Remove",
  onOpen,
}: {
  movies: Movie[];
  onRemove?: (movie: Movie) => void;
  removeLabel?: string;
  onOpen?: (movie: Movie) => void;
}) {
  return (
    <ul className="poster-grid">
      {movies.map((m) => (
        <li key={m.id}>
          <article className="poster-tile">
            <Link
              to="/movie/$slug"
              params={{ slug: m.slug }}
              className="press block"
              aria-label={m.title}
              onClick={() => onOpen?.(m)}
            >
              <StillImage slug={m.slug} atmosphere={m.atmosphere} title={m.title} className="poster-still" />
              <span className="poster-name">{m.title}</span>
              <span className="poster-meta">
                {m.year}
                {m.ratings?.rottenTomatoes != null ? ` · ${Math.round(m.ratings.rottenTomatoes)}%` : ""}
              </span>
            </Link>
            {onRemove ? (
              <button
                type="button"
                className="press poster-remove"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(m);
                }}
              >
                {removeLabel}
              </button>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}

export function PosterRail({ title, movies }: { title: string; movies: Movie[] }) {
  if (!movies.length) return null;
  return (
    <section className="mt-7">
      <h2 className="type-caption uppercase tracking-wide text-marker">{title}</h2>
      <div className="-mx-1 mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {movies.map((m) => (
          <Link
            key={m.id}
            to="/movie/$slug"
            params={{ slug: m.slug }}
            className="press w-[6.75rem] shrink-0"
            aria-label={m.title}
          >
            <StillImage slug={m.slug} atmosphere={m.atmosphere} title={m.title} className="photo-rim poster-still aspect-poster w-full rounded-md" />
            <p className="poster-name mt-1.5">{m.title}</p>
            <p className="poster-meta">
              {m.year}
              {m.ratings?.rottenTomatoes != null ? ` · ${Math.round(m.ratings.rottenTomatoes)}%` : ""}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
