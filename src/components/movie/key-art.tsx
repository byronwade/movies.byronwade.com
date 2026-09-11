import type { Movie } from "@/catalog/types";
import { artSet } from "@/catalog/art";
import { cn } from "@/lib/cn";
import { useState } from "react";

function KeyImg({ urls, srcSet }: { urls: string[]; srcSet?: string }) {
  const [index, setIndex] = useState(0);
  const src = urls[index];
  if (!src) return null;
  return (
    <img
      src={src}
      srcSet={index === 0 ? srcSet : undefined}
      sizes="100vw"
      alt=""
      draggable={false}
      referrerPolicy="no-referrer"
      decoding="async"
      loading="lazy"
      fetchPriority="low"
      className="h-full w-full object-cover"
      onError={() => setIndex((n) => n + 1)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth < 160) setIndex((n) => n + 1);
      }}
    />
  );
}

export function KeyArt({ movie, dim }: { movie: Movie; dim?: boolean }) {
  const set = artSet(movie.id, "backdrop", "key");
  const urls = [set.src].filter((u): u is string => Boolean(u));

  return (
    <div className={cn("key-art", dim && "opacity-40")} aria-hidden>
      <div className="key-ambient">
        <KeyImg urls={urls} srcSet={set.srcSet} />
      </div>
      <div className="key-veil" />
    </div>
  );
}