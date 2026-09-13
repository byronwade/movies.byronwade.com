import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Share } from "lucide-react";
import { LANGUAGE_LABEL, MOVIE_BY_ID } from "@/catalog/movies";
import type { Movie } from "@/catalog/types";
import type { RankedRecommendation } from "@/tasterank/types";
import { useKino } from "@/lib/store";
import { StillImage } from "./still";
import { audienceLabel, runtimeLabel, watchLine } from "./labels";
import { RatingsRow } from "./ratings";
import { useMovieExtras } from "./use-extras";

function Chip({ children }: { children: string }) {
  return <span className="well inline-flex h-7 items-center rounded-full px-3 type-caption">{children}</span>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="type-caption text-marker">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function MovieAbout({
  movie,
  rec,
  onHide,
}: {
  movie: Movie;
  rec?: RankedRecommendation;
  onHide?: () => void;
}) {
  const services = useKino((s) => s.services);
  const spoilerSafe = useKino((s) => s.spoilerSafe);
  const openTrailer = useKino((s) => s.openTrailer);
  const extras = useMovieExtras(movie);
  const [shot, setShot] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const language = LANGUAGE_LABEL[movie.language] ?? movie.language;
  const similar = movie.similarIds.map((id) => MOVIE_BY_ID[id]).filter((m): m is Movie => Boolean(m));
  const gallery = spoilerSafe ? [] : extras.stills;

  return (
    <div>
      <StillImage
        slug={movie.slug}
        atmosphere={movie.atmosphere}
        kind="cover"
        title={movie.title}
        className="photo-rim aspect-video w-full rounded-lg"
      />
      <p className="mt-4 type-caption text-accent">
        {movie.year} · {movie.certification} · {runtimeLabel(movie.runtimeMin)} · {language}
      </p>
      <RatingsRow ratings={movie.ratings} wide className="mt-3" />
      <h2 className="mt-2 type-display text-balance">{movie.title}</h2>
      <p className="mt-1 type-content text-body">{movie.director}</p>
      {watchLine(movie, services) ? <p className="mt-1 type-caption text-accent">{watchLine(movie, services)}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="press well flex h-10 flex-1 items-center justify-center gap-2 type-chrome"
          onClick={async () => {
            const url = `${typeof window !== "undefined" ? window.location.origin : ""}/movie/${movie.slug}`;
            try {
              if (navigator.share) await navigator.share({ title: movie.title, url });
              else {
                await navigator.clipboard.writeText(`${movie.title} (${movie.year}) · ${url}`);
                setShared(true);
                window.setTimeout(() => setShared(false), 1600);
              }
            } catch {
              /* cancelled */
            }
          }}
        >
          <Share className="size-3.5" strokeWidth={1.8} />
          {shared ? "Copied" : "Share"}
        </button>
      </div>
      {rec ? (
        <p className="mt-2 font-mono type-caption text-accent">
          {rec.matchLabel} · {rec.tasteRank}
        </p>
      ) : null}

      {extras.clips.length > 1 ? (
        <Section title="Trailers">
          <div className="extras-rail">
            {extras.clips.map((clip) => (
              <ClipCard
                key={clip.key}
                clip={clip}
                onPlay={() => openTrailer(movie.id, clip.kind === "youtube" ? clip.key : clip.url)}
              />
            ))}
          </div>
        </Section>
      ) : extras.clips[0] || movie.trailerYoutubeId ? (
        <button
          type="button"
          className="press commit mt-4 flex h-11 w-full items-center justify-center gap-2 type-content"
          onClick={() => openTrailer(movie.id, extras.clips[0]?.key)}
        >
          <Play className="size-4 fill-current" />
          Trailer
        </button>
      ) : null}

      {spoilerSafe ? (
        <p className="mt-5 type-content leading-relaxed text-pretty text-body">
          Spoiler-free is on. Plot and stills stay hidden until you turn it off in settings.
        </p>
      ) : (
        <p className="mt-5 type-content leading-relaxed text-pretty">{movie.overview}</p>
      )}

      {gallery.length ? (
        <Section title="Stills">
          <div className="extras-rail">
            {gallery.map((s) => (
              <StillCard key={s.src} src={s.src} onOpen={() => setShot(s.src)} />
            ))}
          </div>
        </Section>
      ) : null}

      {movie.watch.length ? (
        <Section title="Watch">
          <ul className="group divide-y divide-fg/5">
            {movie.watch.map((w) => {
              const yours = w.included && services.includes(w.provider);
              const detail = yours ? "Yours" : w.included ? "Subscription" : "Rent";
              return (
                <li key={w.provider} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2">
                  <span className="type-content">{w.provider}</span>
                  <span className={yours ? "type-caption text-accent" : "type-caption text-marker"}>{detail}</span>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {movie.genres.map((g) => (
          <Chip key={g}>{g}</Chip>
        ))}
      </div>

      <Section title="Film">
        <dl className="group divide-y divide-fg/5">
          <Fact label="Director" value={movie.director} />
          {movie.writers.length ? <Fact label="Writers" value={movie.writers.join(", ")} /> : null}
          <Fact label="Runtime" value={runtimeLabel(movie.runtimeMin)} />
          <Fact label="Released" value={String(movie.year)} />
          <Fact label="Rated" value={movie.certification} />
          <Fact label="Audience" value={audienceLabel(movie.audience)} />
          <Fact label="Language" value={language} />
          {extras.facts.map((f) => (
            <Fact key={`${f.label}-${f.value}`} label={f.label} value={f.value} />
          ))}
        </dl>
      </Section>

      {movie.ratings && (movie.ratings.rottenTomatoes != null || movie.ratings.imdb != null) ? (
        <Section title="Ratings">
          <RatingsRow ratings={movie.ratings} wide className="px-1" />
          <dl className="group mt-3 divide-y divide-fg/5">
            {movie.ratings.rottenTomatoes != null ? (
              <Fact
                label="Tomatometer"
                value={`${Math.round(movie.ratings.rottenTomatoes)}% ${movie.ratings.rottenTomatoes >= 60 ? "Fresh" : "Rotten"}`}
              />
            ) : null}
            {movie.ratings.audience != null ? (
              <Fact label="Audience score" value={`${Math.round(movie.ratings.audience)}%`} />
            ) : null}
            {movie.ratings.imdb != null ? <Fact label="IMDb" value={movie.ratings.imdb.toFixed(1)} /> : null}
            {movie.ratings.metacritic != null ? (
              <Fact label="Metascore" value={String(Math.round(movie.ratings.metacritic))} />
            ) : null}
          </dl>
        </Section>
      ) : null}

      {movie.cast.length ? (
        <Section title="Cast">
          <ul className="group divide-y divide-fg/5">
            {movie.cast.map((c) => (
              <li key={c.name} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2">
                <span className="min-w-0 flex-1 type-content">{c.name}</span>
                <span className="type-caption text-marker">{c.role}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {movie.themes.length && !spoilerSafe ? (
        <Section title="Themes">
          <div className="flex flex-wrap gap-1.5">
            {movie.themes.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </Section>
      ) : null}

      {movie.tones.length || movie.moods.length ? (
        <Section title="Tone">
          <div className="flex flex-wrap gap-1.5">
            {movie.tones.map((t) => (
              <Chip key={`t-${t}`}>{t}</Chip>
            ))}
            {movie.moods.map((m) => (
              <Chip key={`m-${m}`}>{m}</Chip>
            ))}
          </div>
        </Section>
      ) : null}

      {rec?.reasons.length && !spoilerSafe ? (
        <Section title="Why this">
          <ul className="group divide-y divide-fg/5">
            {rec.reasons.map((r, i) => (
              <li key={`${r.type}-${r.label}-${i}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2">
                <span className="type-content">{r.label}</span>
                <span className="font-mono type-caption text-marker">{Math.round(r.contribution * 100)}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {similar.length ? (
        <Section title="Similar">
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {similar.map((m) => (
              <Link
                key={m.id}
                to="/movie/$slug"
                params={{ slug: m.slug }}
                className="press w-[4.75rem] shrink-0"
                aria-label={m.title}
              >
                <StillImage slug={m.slug} atmosphere={m.atmosphere} title={m.title} className="photo-rim aspect-poster w-full rounded-md" />
                <p className="mt-1.5 line-clamp-2 type-caption leading-tight">{m.title}</p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="More">
        <ul className="group divide-y divide-fg/5">
          {extras.grokSlug ? (
            <li>
              <a
                className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 type-content"
                href={`https://grokipedia.com/page/${extras.grokSlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Grokipedia
                <span className="type-caption text-marker">Open</span>
              </a>
            </li>
          ) : null}
          <li>
            <a
              className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 type-content"
              href={
                extras.wikiTitle
                  ? `https://en.wikipedia.org/wiki/${encodeURIComponent(extras.wikiTitle.replace(/ /g, "_"))}`
                  : `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(`${movie.title} ${movie.year} film`)}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia
              <span className="type-caption text-marker">{extras.wikiTitle ? "Open" : "Search"}</span>
            </a>
          </li>
          {extras.imdb ? (
            <li>
              <a
                className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 type-content"
                href={`https://www.imdb.com/title/${extras.imdb}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                IMDb
                <span className="type-caption text-marker">Open</span>
              </a>
            </li>
          ) : null}
          {extras.rotten ? (
            <li>
              <a
                className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 type-content"
                href={`https://www.rottentomatoes.com/${extras.rotten}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rotten Tomatoes
                <span className="type-caption text-marker">Open</span>
              </a>
            </li>
          ) : null}
        </ul>
      </Section>

      {onHide ? (
        <>
          <button
            type="button"
            className="press well mt-8 flex h-11 w-full items-center justify-center type-content text-danger"
            onClick={onHide}
          >
            Not interested
          </button>
          <p className="mt-2 type-caption text-marker">Don’t show this film again. Skip only snoozes it.</p>
        </>
      ) : null}

      {shot ? (
        <button type="button" className="extras-lightbox" onClick={() => setShot(null)} aria-label="Close still">
          <img src={shot} alt="" className="extras-lightbox-img" referrerPolicy="no-referrer" />
        </button>
      ) : null}
    </div>
  );
}

function StillCard({ src, onOpen }: { src: string; onOpen: () => void }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <button type="button" className="press extras-still" onClick={onOpen}>
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setOk(false)}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth < 80) setOk(false);
        }}
      />
    </button>
  );
}

function ClipCard({
  clip,
  onPlay,
}: {
  clip: { key: string; label: string; thumb?: string };
  onPlay: () => void;
}) {
  const [ok, setOk] = useState(true);
  return (
    <button type="button" className="press extras-clip" onClick={onPlay} aria-label={clip.label}>
      {ok && clip.thumb ? (
        <img
          src={clip.thumb}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setOk(false)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth < 160) setOk(false);
          }}
        />
      ) : (
        <span className="grid h-full w-full place-items-center well" />
      )}
      <span className="extras-clip-play">
        <Play className="ml-0.5 size-4 fill-current" />
      </span>
      <span className="extras-clip-label">{clip.label}</span>
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 px-4 py-2">
      <dt className="type-caption text-marker">{label}</dt>
      <dd className="min-w-0 text-right type-content">{value}</dd>
    </div>
  );
}
