import { useRef, useState, type ReactNode } from "react";
import { Bookmark, Eye, Heart, SkipForward, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { useKino } from "@/lib/store";
import { tap } from "@/lib/haptics";
import type { Movie } from "@/catalog/types";

export function MovieActions({ movie, className }: { movie: Movie; className?: string }) {
  const record = useKino((s) => s.record);
  const state = useKino((s) => s.movieState[movie.id]);
  const passed = Boolean(state?.notInterested);
  const favorited = Boolean(state?.favorited);
  const interested = Boolean(state?.interested);
  return (
    <div className={cn("action-bar", className)}>
      <Action
        label="Seen"
        tone="commit"
        active={state?.seen}
        outline={<Eye className="size-6" strokeWidth={1.6} />}
        filled={<Eye className="size-6" strokeWidth={1.6} fill="currentColor" />}
        onClick={() => record(state?.seen ? "unseen" : "seen", movie.id, { label: state?.seen ? "Removed from watched" : "Marked seen" })}
        advance={!state?.seen}
      />
      <Action
        label="Favorite"
        hint={favorited ? "Remove from favorites" : "Favorite — one of yours"}
        tone="danger"
        active={favorited}
        outline={<Heart className="size-6" strokeWidth={1.6} />}
        filled={<Heart className="size-6" strokeWidth={1.6} fill="currentColor" />}
        onClick={() =>
          record(favorited ? "unfavorite" : "favorite", movie.id, {
            label: favorited ? "Removed from favorites" : "Favorited",
          })
        }
        advance={!favorited}
      />
      <Action
        label={state?.saved ? "Saved" : "Save"}
        tone="accent"
        active={state?.saved}
        outline={<Bookmark className="size-6" strokeWidth={1.6} />}
        filled={<Bookmark className="size-6" strokeWidth={1.6} fill="currentColor" />}
        onClick={() => record(state?.saved ? "unsave" : "save", movie.id, { label: state?.saved ? "Removed" : "Saved" })}
        advance={!state?.saved}
      />
      <Action
        label="Interested"
        hint={interested ? "Remove from interested" : "Interested — show this kind more"}
        tone="fg"
        active={interested}
        outline={<ThumbsUp className="size-6" strokeWidth={1.6} />}
        filled={<ThumbsUp className="size-6" strokeWidth={1.6} fill="currentColor" />}
        onClick={() =>
          record(interested ? "uninterested" : "interested", movie.id, {
            label: interested ? "Removed from interested" : "Interested",
          })
        }
        advance={false}
      />
      <Action
        label="Skip"
        hint="Skip — show again later"
        tone="fg"
        outline={<SkipForward className="size-6" strokeWidth={1.6} />}
        filled={<SkipForward className="size-6" strokeWidth={2.2} />}
        onClick={() => record("skip", movie.id, { label: "Skipped" })}
        advance
      />
      <Action
        label="Not into"
        hint={passed ? "Show this again" : "Not interested — don’t show again"}
        tone="danger"
        active={passed}
        outline={<ThumbsDown className="size-6" strokeWidth={1.6} />}
        filled={<ThumbsDown className="size-6" strokeWidth={1.6} fill="currentColor" />}
        onClick={() =>
          record(passed ? "show_again" : "not_interested", movie.id, {
            label: passed ? "Showing again" : "Not interested",
          })
        }
        advance={!passed}
      />
    </div>
  );
}

function Action({
  label,
  hint,
  outline,
  filled,
  onClick,
  active,
  advance,
  tone,
}: {
  label: string;
  hint?: string;
  outline: ReactNode;
  filled: ReactNode;
  onClick: () => void;
  active?: boolean;
  advance?: boolean;
  tone: "commit" | "accent" | "danger" | "fg";
}) {
  const [pop, setPop] = useState(false);
  const lock = useRef(false);
  const fire = () => {
    if (lock.current) return;
    lock.current = true;
    if (advance) setPop(true);
    tap(tone === "danger" ? "warn" : "ok");
    onClick();
    window.setTimeout(() => {
      lock.current = false;
    }, 200);
  };
  return (
    <button
      type="button"
      onClick={fire}
      aria-pressed={active ? true : undefined}
      aria-label={hint ?? label}
      data-tone={tone}
      className={cn("action-hit press", (active || pop) && "is-on", pop && "is-pop")}
    >
      <span className="glyph">
        <span className="ink">{outline}</span>
        <span className="fill">{filled}</span>
      </span>
      <span className="action-label">{label}</span>
    </button>
  );
}
