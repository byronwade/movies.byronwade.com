import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { MOVIE_BY_SLUG } from "@/catalog/movies";
import { artFallbacks, artSet } from "@/catalog/art";
import { cn } from "@/lib/cn";

export type CoverShape = "tall" | "wide";

export function stillUrl(youtubeId: string | undefined, size: "max" | "hq") {
  if (!youtubeId) return undefined;
  return size === "max"
    ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
    : `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

function listed(...urls: (string | undefined)[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

const HERO_TALL_SIZES = "(max-width: 959px) 72vw, 22.5rem";
const HERO_WIDE_SIZES = "(min-width: 960px) min(40vw, 42rem), (min-width: 720px) min(38vw, 36rem), 72vw";
const POSTER_SIZES = "(min-width: 960px) 10rem, (min-width: 720px) 9rem, 33vw";
const COVER_SIZES = "(min-width: 960px) min(40vw, 42rem), (min-width: 720px) min(38vw, 36rem), 100vw";

function sourcesFor(slug: string, kind: "hero" | "cover" | "poster") {
  const movie = MOVIE_BY_SLUG[slug];
  const id = movie?.id ?? slug;
  const posterArt = artSet(id, "poster", "poster");
  const wideArt = artSet(id, "backdrop", kind === "poster" ? "poster" : kind === "hero" ? "hero" : "cover");
  const yt = stillUrl(movie?.trailerYoutubeId, "max");
  const ytHq = stillUrl(movie?.trailerYoutubeId, "hq");
  const poster = listed(posterArt.src, ...artFallbacks(id, "poster", "poster"), ytHq);
  const wide = listed(wideArt.src, ...artFallbacks(id, "backdrop", kind === "hero" ? "hero" : "cover"), posterArt.src, yt, ytHq);
  if (kind === "hero") {
    return {
      poster,
      wide,
      posterSet: posterArt.srcSet,
      wideSet: wideArt.srcSet,
      posterSizes: HERO_TALL_SIZES,
      wideSizes: HERO_WIDE_SIZES,
    };
  }
  if (kind === "cover") {
    return { poster: wide, wide, posterSet: wideArt.srcSet, wideSet: wideArt.srcSet, posterSizes: COVER_SIZES, wideSizes: COVER_SIZES };
  }
  return { poster, wide: poster, posterSet: posterArt.srcSet, wideSet: posterArt.srcSet, posterSizes: POSTER_SIZES, wideSizes: POSTER_SIZES };
}

function ArtImg({
  urls,
  srcSet,
  sizes,
  className,
  priority,
  onFail,
}: {
  urls: string[];
  srcSet?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  onFail?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const src = urls[index];
  if (!src) return null;
  return (
    <img
      src={src}
      srcSet={index === 0 ? srcSet : undefined}
      sizes={index === 0 ? sizes : undefined}
      alt=""
      draggable={false}
      referrerPolicy="no-referrer"
      fetchPriority={priority ? "high" : "low"}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      className={cn("pointer-events-none absolute inset-0 h-full w-full bg-bg object-cover", className)}
      onError={() => {
        if (index + 1 >= urls.length) onFail?.();
        else setIndex((n) => n + 1);
      }}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth >= 80) return;
        if (index + 1 >= urls.length) return;
        setIndex((n) => n + 1);
      }}
    />
  );
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useCoverShape(slotRef: RefObject<HTMLElement | null>, stillRef: RefObject<HTMLElement | null>) {
  const [shape, setShape] = useState<CoverShape>(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 720px)").matches ? "wide" : "tall",
  );
  const [morphing, setMorphing] = useState(false);
  const firstRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    let current: CoverShape = shape;
    let primed = false;
    let raf = 0;
    const commit = (next: CoverShape) => {
      if (next === current) return;
      const still = stillRef.current;
      if (still && primed && !reducedMotion()) firstRect.current = still.getBoundingClientRect();
      current = next;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (firstRect.current) setMorphing(true);
        setShape(next);
      });
    };
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box || box.width < 2 || box.height < 2) return;
      const ar = box.width / box.height;
      if (!primed) {
        primed = true;
        current = ar >= 1 ? "wide" : "tall";
        setShape(current);
        return;
      }
      if (current === "tall" && ar >= 1.2) commit("wide");
      else if (current === "wide" && ar <= 0.85) commit("tall");
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const el = stillRef.current;
    const first = firstRect.current;
    if (!el || !first) return;
    firstRect.current = null;
    const last = el.getBoundingClientRect();
    if (Math.abs(last.width - first.width) < 2 && Math.abs(last.height - first.height) < 2) {
      setMorphing(false);
      return;
    }
    el.style.transition = "none";
    el.style.aspectRatio = "auto";
    el.style.maxWidth = "none";
    el.style.maxHeight = "none";
    el.style.width = `${first.width}px`;
    el.style.height = `${first.height}px`;
    void el.offsetWidth;
    el.style.transition = "width var(--motion-slow) var(--ease-out), height var(--motion-slow) var(--ease-out)";
    el.style.width = `${last.width}px`;
    el.style.height = `${last.height}px`;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.style.transition = "";
      el.style.width = "";
      el.style.height = "";
      el.style.aspectRatio = "";
      el.style.maxWidth = "";
      el.style.maxHeight = "";
      setMorphing(false);
    };
    el.addEventListener("transitionend", finish);
    const timeout = window.setTimeout(finish, 520);
    return () => {
      el.removeEventListener("transitionend", finish);
      window.clearTimeout(timeout);
      finish();
    };
  }, [shape]);

  return { shape, morphing };
}

export function CoverSlot({
  children,
}: {
  children: (api: { shape: CoverShape; stillRef: RefObject<HTMLButtonElement | null>; morphing: boolean }) => ReactNode;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLButtonElement>(null);
  const { shape, morphing } = useCoverShape(slotRef, stillRef);
  return (
    <div ref={slotRef} className={cn("cover-slot", morphing && "is-morphing")} data-cover={shape}>
      {children({ shape, stillRef, morphing })}
    </div>
  );
}

export function StillImage({
  slug,
  atmosphere,
  title,
  className,
  alt,
  kind = "poster",
  shape = "tall",
  priority = false,
  morphing = false,
}: {
  slug: string;
  atmosphere: string;
  title?: string;
  className?: string;
  alt?: string;
  kind?: "hero" | "cover" | "poster";
  shape?: CoverShape;
  priority?: boolean;
  morphing?: boolean;
}) {
  const { poster, wide, posterSet, wideSet, posterSizes, wideSizes } = sourcesFor(slug, kind);
  const [failed, setFailed] = useState(false);
  const hasArt = Boolean(poster[0] || wide[0]) && !failed;
  const showTall = kind !== "hero" || shape === "tall" || morphing;
  const showWide = kind === "hero" && (shape === "wide" || morphing);

  return (
    <div
      role="img"
      aria-label={alt ?? title ?? slug}
      className={cn(
        "relative overflow-hidden bg-bg",
        hasArt ? "atm-photo" : cn("atm", `atm-${atmosphere}`),
        className,
      )}
    >
      {kind === "hero" ? (
        <>
          {showTall ? (
            <ArtImg urls={poster} srcSet={posterSet} sizes={posterSizes} className="cover-photo-tall" priority={priority && shape === "tall"} onFail={() => setFailed(true)} />
          ) : null}
          {showWide ? (
            <ArtImg urls={wide} srcSet={wideSet} sizes={wideSizes} className="cover-photo-wide" priority={priority && shape === "wide"} onFail={() => setFailed(true)} />
          ) : null}
        </>
      ) : (
        <ArtImg
          urls={kind === "cover" ? wide : poster}
          srcSet={kind === "cover" ? wideSet : posterSet}
          sizes={kind === "cover" ? wideSizes : posterSizes}
          priority={priority}
          onFail={() => setFailed(true)}
        />
      )}
      {!hasArt && title ? <span>{title}</span> : null}
    </div>
  );
}
