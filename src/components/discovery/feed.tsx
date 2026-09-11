import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useKino } from "@/lib/store";
import { MovieViewport } from "@/components/movie/viewport";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { FeedFilters } from "./filters";
import { signalCount, TRAIN_GOAL } from "@/tasterank";
import { prefetchArt } from "@/catalog/art";

/** cubic-bezier(0.23, 1, 0.32, 1) — thorbis --ease-out */
function easeOut(t: number) {
  const cx = 0.69;
  const bx = 3 * (0.32 - 0.23) - cx;
  const ax = 1 - cx - bx;
  const cy = 3;
  const by = 3 * (1 - 1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const d = sampleDX(u);
    if (Math.abs(d) < 1e-6) break;
    u -= (sampleX(u) - t) / d;
    if (u < 0) u = 0;
    else if (u > 1) u = 1;
  }
  return sampleY(u);
}

const PAGE_MS = 200;

function SwipeHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("kino.hint.swipe") === "1") return;
      sessionStorage.setItem("kino.hint.swipe", "1");
    } catch {
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 2800);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return <p className="feed-hint">{coarse ? "Swipe for the next film" : "Scroll or ↓ for the next film"}</p>;
}

function reduceMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DiscoveryFeed({ mode = "for-you" }: { mode?: "for-you" | "tune" }) {
  const queue = useKino((s) => s.queue);
  const index = useKino((s) => s.index);
  const setIndex = useKino((s) => s.setIndex);
  const trailerFor = useKino((s) => s.trailerFor);
  const events = useKino((s) => s.events);
  const setFeedMode = useKino((s) => s.setFeedMode);
  const tonight = useKino((s) => s.tonight);
  const setTonight = useKino((s) => s.setTonight);
  const tune = useKino((s) => s.tune);
  const setTune = useKino((s) => s.setTune);
  const scroller = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);
  const queueLenRef = useRef(queue.length);
  const locking = useRef(false);
  const frame = useRef(0);
  const lenRef = useRef(queue.length);
  indexRef.current = index;
  queueLenRef.current = queue.length;

  useLayoutEffect(() => {
    setFeedMode(mode);
  }, [mode, setFeedMode]);

  const settle = useCallback((root: HTMLDivElement, top: number, instant: boolean) => {
    if (frame.current) cancelAnimationFrame(frame.current);
    const from = root.scrollTop;
    const dist = top - from;
    if (Math.abs(dist) < 1 || instant || reduceMotion()) {
      root.scrollTop = top;
      locking.current = false;
      frame.current = 0;
      return;
    }
    locking.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / PAGE_MS);
      root.scrollTop = from + dist * easeOut(t);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      frame.current = 0;
      locking.current = false;
    };
    frame.current = requestAnimationFrame(tick);
  }, []);

  const go = useCallback(
    (next: number, instant = false) => {
      const root = scroller.current;
      if (!root) return;
      const clamped = Math.max(0, Math.min(next, queueLenRef.current - 1));
      locking.current = true;
      setIndex(clamped);
      settle(root, clamped * root.clientHeight, instant);
    },
    [setIndex, settle],
  );

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const expected = index * root.clientHeight;
    const jumped = lenRef.current !== queue.length;
    lenRef.current = queue.length;
    if (Math.abs(root.scrollTop - expected) <= 2) return;
    if (locking.current && !jumped) return;
    settle(root, expected, jumped);
  }, [index, queue, settle]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const onScroll = () => {
      if (locking.current) return;
      const i = Math.round(root.scrollTop / (root.clientHeight || 1));
      if (i !== indexRef.current && i >= 0 && i < queueLenRef.current) setIndex(i);
    };
    const unlock = () => {
      if (!frame.current) locking.current = false;
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", unlock);
    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", unlock);
    };
  }, [setIndex]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      if (useKino.getState().trailerFor) return;
      if (e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(".sheet-scrim, .sheet-card, [role='dialog']")) return;
      e.preventDefault();
      if (locking.current) return;
      const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(dy) < 8) return;
      go(indexRef.current + (dy > 0 ? 1 : -1));
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useKino.getState().trailerFor) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable], .sheet-card, .feed-filter-panel")) return;
      const k = e.key.toLowerCase();
      if (e.key === "ArrowDown" || e.key === "PageDown" || k === "j") {
        e.preventDefault();
        go(indexRef.current + 1);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "PageUp" || k === "k") {
        e.preventDefault();
        go(indexRef.current - 1);
        return;
      }
      const rec = useKino.getState().queue[indexRef.current];
      if (!rec) return;
      const st = useKino.getState().movieState[rec.movie.id];
      const record = useKino.getState().record;
      if (k === "f") {
        e.preventDefault();
        record(st?.favorited ? "unfavorite" : "favorite", rec.movie.id, { label: st?.favorited ? "Removed from favorites" : "Favorited" });
      } else if (k === "s") {
        e.preventDefault();
        record(st?.saved ? "unsave" : "save", rec.movie.id, { label: st?.saved ? "Removed" : "Saved" });
      } else if (k === "e") {
        e.preventDefault();
        record(st?.seen ? "unseen" : "seen", rec.movie.id, { label: st?.seen ? "Removed from watched" : "Marked seen" });
      } else if (k === "i") {
        e.preventDefault();
        record(st?.interested ? "uninterested" : "interested", rec.movie.id, { label: st?.interested ? "Removed from interested" : "Interested" });
      } else if (k === "n" || k === "x") {
        e.preventDefault();
        record(st?.notInterested ? "show_again" : "not_interested", rec.movie.id, { label: st?.notInterested ? "Showing again" : "Not interested" });
      } else if (e.key === " " && rec.movie.trailerYoutubeId) {
        e.preventDefault();
        useKino.getState().openTrailer(rec.movie.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const onResize = () => go(indexRef.current, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [go]);

  useEffect(() => {
    for (const rec of queue.slice(index, index + 3)) prefetchArt(rec.movie.id);
  }, [index, queue]);

  const filtered = Boolean(
    tonight ||
      tune.familySafe ||
      tune.era !== "any" ||
      tune.shortOnly ||
      tune.streamingOnly,
  );
  if (!queue.length) {
    return (
      <div className="grid h-full place-items-center px-6">
        <div className="max-w-sm">
          <h1 className="type-page">{mode === "tune" ? "Fine tune is clear" : "The queue is empty"}</h1>
          <p className="mt-2 type-content text-body">
            {mode === "tune"
              ? "You’ve marked everything in this pass. For you can take it from here."
              : filtered
                ? "Nothing matches these filters. Clear them to fill For you again."
                : "You’ve seen, saved, or hidden everything here. Fine tune more films, switch profile, or turn off English only."}
          </p>
          {mode === "for-you" && filtered ? (
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setTonight(null);
                setTune({ familySafe: false, era: "any" });
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Link to={mode === "tune" ? "/" : "/tune"} className="mt-5 block">
              <Button className="w-full">{mode === "tune" ? "Open For you" : "Fine tune"}</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const start = Math.max(0, index - 1);
  const end = Math.min(queue.length, index + 2);
  const n = signalCount(events);

  return (
    <div className={cn("relative h-full min-h-0", mode === "tune" && "has-tune-note")}>
      {mode === "for-you" ? <FeedFilters /> : (
        <p className="feed-tune-note">
          {n >= TRAIN_GOAL ? "For you is trained. Keep marking what you know." : `Mark films you know · ${n}/${TRAIN_GOAL}`}
        </p>
      )}
      <SwipeHint />
      <div
        ref={scroller}
        className={cn("feed-pager absolute inset-0 app-scroll no-scrollbar", trailerFor && "overflow-hidden")}
      >
        {queue.map((rec, i) => (
          <div key={`${rec.movie.id}-${i}`} className="feed-page">
            {i >= start && i <= end ? <MovieViewport rec={rec} active={i === index} /> : <div className="h-full bg-bg" />}
          </div>
        ))}
      </div>
    </div>
  );
}
