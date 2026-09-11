import { useEffect } from "react";
import { useKino } from "@/lib/store";
import { MOVIE_BY_ID } from "@/catalog/movies";
import { KeyArt } from "./key-art";
import { useMovieExtras } from "./use-extras";
import { ChevronLeft, Play } from "lucide-react";
import { cn } from "@/lib/cn";

export function TrailerOverlay() {
  const id = useKino((s) => s.trailerFor);
  const clip = useKino((s) => s.trailerClip);
  const open = useKino((s) => s.openTrailer);
  if (!id) return null;
  const movie = MOVIE_BY_ID[id];
  if (!movie) return null;
  return <TrailerPlayer movie={movie} clip={clip} onClose={() => open(null)} onPick={(key) => open(movie.id, key)} />;
}

function TrailerPlayer({
  movie,
  clip,
  onClose,
  onPick,
}: {
  movie: NonNullable<(typeof MOVIE_BY_ID)[string]>;
  clip: string | null;
  onClose: () => void;
  onPick: (key: string) => void;
}) {
  const extras = useMovieExtras(movie);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const clips = extras.clips.length
    ? extras.clips
    : movie.trailerYoutubeId
      ? [{ kind: "youtube" as const, key: movie.trailerYoutubeId, label: "Trailer", thumb: `https://i.ytimg.com/vi/${movie.trailerYoutubeId}/hqdefault.jpg` }]
      : [];
  const active = clips.find((c) => c.key === clip) ?? clips[0];
  if (!active) return null;
  const youtube = active.kind === "youtube" ? active.key : null;
  const preview = active.kind === "preview" ? active.url ?? active.key : null;

  return (
    <div className="overlay-layer overflow-y-auto bg-bg/80" role="dialog" aria-label={`Trailer · ${movie.title}`}>
      <KeyArt movie={movie} dim />
      <div
        className="relative z-10 mx-auto flex min-h-full w-full flex-col trailer-frame"
        style={{ paddingTop: "var(--safe-top)", paddingBottom: "calc(var(--tab-bar-h) + 0.85rem)" }}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-3">
          <button type="button" className="sheet-back press" onClick={onClose}>
            <ChevronLeft className="size-5" strokeWidth={2.2} aria-hidden />
            Close
          </button>
          {youtube ? (
            <a
              href={`https://www.youtube.com/watch?v=${youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex h-11 items-center rounded-full px-4 well type-chrome"
            >
              YouTube
            </a>
          ) : (
            <span className="type-chrome text-marker">{active.label}</span>
          )}
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-4">
          <div className="photo-rim aspect-video w-full overflow-hidden rounded-2xl bg-bg">
            {youtube ? (
              <iframe
                title={`${movie.title} ${active.label}`}
                className="h-full w-full border-0 bg-bg"
                src={`https://www.youtube.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : preview ? (
              <video className="h-full w-full bg-bg" src={preview} controls autoPlay playsInline />
            ) : null}
          </div>
        </div>
        {clips.length > 1 ? (
          <div className="extras-rail shrink-0 px-5 pb-2">
            {clips.map((c) => (
              <button
                key={c.key}
                type="button"
                className={cn("press extras-clip", c.key === active.key && "is-on")}
                onClick={() => onPick(c.key)}
                aria-label={c.label}
              >
                {c.thumb ? <img src={c.thumb} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : null}
                <span className="extras-clip-play">
                  <Play className="ml-0.5 size-3 fill-current" />
                </span>
                <span className="extras-clip-label">{c.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
