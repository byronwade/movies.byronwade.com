import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useKino } from "@/lib/store";
import { ERA_OPTIONS, FEED_GENRES, FEED_MOODS, FEED_SERVICES, FEED_WHO } from "@/tasterank";

function Chip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={cn("press feed-chip", on && "is-on")}>
      {label}
    </button>
  );
}

export function FeedFilters() {
  const tonight = useKino((s) => s.tonight);
  const setTonight = useKino((s) => s.setTonight);
  const tune = useKino((s) => s.tune);
  const setTune = useKino((s) => s.setTune);
  const profiles = useKino((s) => s.profiles);
  const who = tonight?.who ?? "All";
  const mood = tonight?.mood ?? null;
  const genre = tonight?.genre ?? null;
  const service = tonight?.service ?? null;
  const fresh = Boolean(tonight?.fresh);
  const room = tonight?.room ?? [];
  const active = Boolean((tonight && tonight.who && tonight.who !== "All") || mood || genre || service || fresh || tune.familySafe || tune.era !== "any" || room.length);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const patch = (next: {
    who?: string;
    mood?: string | null;
    genre?: string | null;
    service?: string | null;
    fresh?: boolean;
    room?: string[];
  }) => {
    const whoNext = next.who ?? who;
    const moodNext = next.mood === undefined ? mood : next.mood;
    const genreNext = next.genre === undefined ? genre : next.genre;
    const serviceNext = next.service === undefined ? service : next.service;
    const freshNext = next.fresh === undefined ? fresh : next.fresh;
    const roomNext = next.room === undefined ? room : next.room;
    if ((whoNext === "All" || !whoNext) && !moodNext && !genreNext && !serviceNext && !freshNext && !roomNext.length) setTonight(null);
    else
      setTonight({
        who: whoNext === "All" ? "All" : whoNext,
        mood: moodNext,
        genre: genreNext,
        service: serviceNext,
        fresh: freshNext,
        room: roomNext.length ? roomNext : undefined,
      });
  };

  return (
    <div ref={root} className="feed-filter">
      {active && !open ? (
        <div className="feed-filter-active">
          {who !== "All" ? <Chip label={who} on onClick={() => patch({ who: "All" })} /> : null}
          {room.map((id) => {
            const p = profiles.find((x) => x.id === id);
            return p ? <Chip key={id} label={p.name} on onClick={() => patch({ room: room.filter((x) => x !== id) })} /> : null;
          })}
          {mood ? <Chip label={mood} on onClick={() => patch({ mood: null })} /> : null}
          {genre ? <Chip label={genre} on onClick={() => patch({ genre: null })} /> : null}
          {service ? <Chip label={service} on onClick={() => patch({ service: null })} /> : null}
          {fresh ? <Chip label="New" on onClick={() => patch({ fresh: false })} /> : null}
          {tune.era !== "any" && !fresh ? (
            <Chip label={ERA_OPTIONS.find((e) => e.id === tune.era)?.label ?? "Era"} on onClick={() => setTune({ era: "any" })} />
          ) : null}
          {tune.familySafe ? <Chip label="Family" on onClick={() => setTune({ familySafe: false })} /> : null}
        </div>
      ) : null}
      <div className="relative">
      <button
        type="button"
        className={cn("press feed-filter-btn", open && "is-open", active && "is-on")}
        aria-expanded={open}
        aria-label="Feed filters"
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal className="size-4" strokeWidth={1.8} />
        {active ? <span className="feed-filter-dot" /> : null}
      </button>
      {open ? (
        <div className="feed-filter-panel">
          <p className="feed-filter-kicker">Feed</p>
          <p className="feed-filter-label">This room</p>
          <div className="feed-filter-row">
            {profiles.map((p) => (
              <Chip
                key={p.id}
                label={p.name}
                on={room.includes(p.id)}
                onClick={() =>
                  patch({
                    room: room.includes(p.id) ? room.filter((id) => id !== p.id) : [...room, p.id],
                  })
                }
              />
            ))}
          </div>
          <p className="feed-filter-label">Who</p>
          <div className="feed-filter-row">
            <Chip label="All" on={who === "All"} onClick={() => patch({ who: "All" })} />
            {FEED_WHO.map((w) => (
              <Chip key={w} label={w} on={who === w} onClick={() => patch({ who: w })} />
            ))}
          </div>
          <p className="feed-filter-label">Mood</p>
          <div className="feed-filter-row">
            <Chip label="All" on={!mood} onClick={() => patch({ mood: null })} />
            {FEED_MOODS.map((m) => (
              <Chip key={m} label={m} on={mood === m} onClick={() => patch({ mood: m })} />
            ))}
          </div>
          <p className="feed-filter-label">Genre</p>
          <div className="feed-filter-row">
            <Chip label="All" on={!genre} onClick={() => patch({ genre: null })} />
            {FEED_GENRES.map((g) => (
              <Chip key={g} label={g} on={genre === g} onClick={() => patch({ genre: g })} />
            ))}
          </div>
          <p className="feed-filter-label">Now playing on</p>
          <div className="feed-filter-row">
            <Chip label="All" on={!service} onClick={() => patch({ service: null })} />
            {FEED_SERVICES.map((s) => (
              <Chip key={s} label={s} on={service === s} onClick={() => patch({ service: s })} />
            ))}
          </div>
          <p className="feed-filter-label">Released</p>
          <div className="feed-filter-row">
            <Chip label="New" on={fresh} onClick={() => {
              patch({ fresh: !fresh });
              if (!fresh) setTune({ era: "any" });
            }} />
            {ERA_OPTIONS.map((e) => (
              <Chip
                key={e.id}
                label={e.label}
                on={!fresh && tune.era === e.id}
                onClick={() => {
                  if (fresh) patch({ fresh: false });
                  setTune({ era: e.id });
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="type-chrome">Family-safe</p>
            <button
              type="button"
              className={cn("press feed-chip", tune.familySafe && "is-on")}
              onClick={() => setTune({ familySafe: !tune.familySafe })}
            >
              {tune.familySafe ? "On" : "Off"}
            </button>
          </div>
          {active ? (
            <button
              type="button"
              className="mt-3 flex h-10 w-full items-center justify-center type-chrome text-body"
              onClick={() => {
                setTonight(null);
                if (tune.familySafe || tune.era !== "any") setTune({ familySafe: false, era: "any" });
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}
      </div>
    </div>
  );
}
