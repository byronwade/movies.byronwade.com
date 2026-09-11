import { useEffect, useState } from "react";
import type { Movie } from "@/catalog/types";
import { EMPTY_EXTRAS, mergeClips, type MovieExtras } from "@/lib/movie-extras";
import { pullMovieExtras } from "@/lib/server/movie-extras";

const mem = new Map<string, MovieExtras>();

export function useMovieExtras(movie: Movie) {
  const seed: MovieExtras = {
    ...EMPTY_EXTRAS,
    clips: mergeClips(movie.trailerYoutubeId, []),
  };
  const [extras, setExtras] = useState<MovieExtras>(() => mem.get(movie.id) ?? seed);

  useEffect(() => {
    const cached = mem.get(movie.id);
    if (cached) {
      setExtras(cached);
      return;
    }
    setExtras(seed);
    let live = true;
    void pullMovieExtras({
      data: { id: movie.id, title: movie.title, year: movie.year, trailer: movie.trailerYoutubeId },
    })
      .then((data) => {
        const next: MovieExtras = {
          ...EMPTY_EXTRAS,
          ...data,
          clips: data.clips.length ? data.clips : seed.clips,
        };
        mem.set(movie.id, next);
        if (live) setExtras(next);
      })
      .catch(() => {
        if (live) setExtras(seed);
      });
    return () => {
      live = false;
    };
  }, [movie.id, movie.title, movie.year, movie.trailerYoutubeId]);

  return extras;
}
