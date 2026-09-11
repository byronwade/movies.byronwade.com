import { useEffect, useState } from "react";
import { ChevronRight, Play } from "lucide-react";
import type { RankedRecommendation } from "@/tasterank/types";
import { useKino } from "@/lib/store";
import { NativeSheet } from "@/components/chrome/sheet";
import { KeyArt } from "./key-art";
import { CoverSlot, StillImage } from "./still";
import { MovieActions } from "./actions";
import { MovieAbout } from "./about";
import { runtimeLabel, watchLine } from "./labels";
import { RatingsRow } from "./ratings";
import { clockLine, minutesUntilBed } from "@/tasterank";

export function MovieViewport({ rec, active }: { rec: RankedRecommendation; active: boolean }) {
  const movie = rec.movie;
  const record = useKino((s) => s.record);
  const openTrailer = useKino((s) => s.openTrailer);
  const trailerFor = useKino((s) => s.trailerFor);
  const services = useKino((s) => s.services);
  const playing = active && trailerFor === movie.id;
  const [more, setMore] = useState(false);
  const genre = movie.genres.slice(0, 2).join(" · ");
  const left = minutesUntilBed();
  const clock = clockLine(movie.runtimeMin, left);
  const owned = rec.matchLabel === "You own this";

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => {
      const s = useKino.getState().movieState[movie.id];
      if (s?.seen || s?.notInterested || s?.saved || s?.favorited) return;
      useKino.getState().record("linger", movie.id, { source: "viewport" });
    }, 8000);
    return () => window.clearTimeout(t);
  }, [active, movie.id]);

  useEffect(() => {
    if (trailerFor) setMore(false);
  }, [trailerFor]);

  const openAbout = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    setMore(true);
    queueMicrotask(() => record("details_opened", movie.id));
  };

  return (
    <section className="relative h-full w-full overflow-hidden" aria-label={movie.title}>
      {active ? <KeyArt movie={movie} dim={playing} /> : <div className="key-art" aria-hidden />}
      <div className="cinema-stage">
        <button type="button" className="cinema-copy cover-title press" onClick={openAbout}>
          <h1 className="line-clamp-2 type-display">{movie.title}</h1>
          <p className="cover-meta mt-1">
            {movie.year} · {movie.certification} · {runtimeLabel(movie.runtimeMin)}
            {genre ? ` · ${genre}` : ""}
          </p>
        </button>
        <CoverSlot>
          {({ shape, stillRef, morphing }) => (
            <button
              ref={stillRef}
              type="button"
              className="cover-still photo-rim"
              onClick={() => (movie.trailerYoutubeId ? openTrailer(movie.id) : openAbout())}
              aria-label={movie.trailerYoutubeId ? "Watch trailer" : "About"}
            >
              <StillImage
                slug={movie.slug}
                atmosphere={movie.atmosphere}
                kind="hero"
                shape={shape}
                morphing={morphing}
                priority={active}
                className="absolute inset-0 h-full w-full"
              />
              {active && movie.trailerYoutubeId ? (
                <span className="cover-play pointer-events-none absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
                  <Play className="ml-0.5 size-4 fill-current" />
                </span>
              ) : null}
            </button>
          )}
        </CoverSlot>
        <div className="cinema-dock">
          <MovieActions movie={movie} />
          <button type="button" className="cover-card press mt-2 w-full" onClick={openAbout} aria-label={`About ${movie.title}`}>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="type-caption tracking-wide text-accent">
                  {rec.matchLabel}
                  <span className="ml-1.5 font-mono tabular-nums text-marker">{rec.tasteRank}</span>
                </span>
                <RatingsRow ratings={movie.ratings} className="cover-scores" />
              </span>
              <span className="cover-blurb type-content leading-snug">{movie.overview}</span>
              <span className="mt-1 block truncate type-caption text-body">
                {[owned ? "On your shelf" : null, clock, watchLine(movie, services)].filter(Boolean).join(" · ")}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-marker" strokeWidth={1.8} aria-hidden />
          </button>
        </div>
      </div>
      <NativeSheet open={more} onClose={() => setMore(false)} label={`About ${movie.title}`}>
        <MovieAbout
          movie={movie}
          rec={rec}
          onHide={() => {
            record("not_interested", movie.id, { label: "Not interested" });
            setMore(false);
          }}
        />
      </NativeSheet>
    </section>
  );
}
