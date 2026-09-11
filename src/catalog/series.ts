import { MOVIE_BY_ID, MOVIES } from "./movies.ts";
import type { Movie } from "./types.ts";
import { titleKey } from "./title-key.ts";

const GROUPS: string[][] = [
  ["lord of the rings", "hobbit"],
  ["dune"],
  ["john wick"],
  ["alien", "aliens", "prometheus", "covenant"],
  ["blade runner"],
  ["the matrix", "matrix reloaded", "matrix revolutions", "matrix resurrections"],
  ["mad max"],
  ["mission impossible"],
  ["star wars", "empire strikes", "return of the jedi", "phantom menace", "attack of the clones", "revenge of the sith", "force awakens", "last jedi", "rise of skywalker", "rogue one", "solo a star"],
  ["indiana jones"],
  ["jurassic"],
  ["toy story"],
  ["incredibles"],
  ["paddington"],
  ["godfather"],
  ["dark knight", "batman begins", "the batman"],
  ["terminator"],
  ["gladiator"],
  ["wicked"],
  ["hunger games"],
  ["harry potter", "fantastic beasts"],
  ["spider man", "spiderman"],
  ["guardians of the galaxy"],
  ["john wick"],
  ["equalizer"],
  ["bourne"],
  ["oceans"],
  ["scream"],
  ["halloween"],
  ["conjur"],
  ["fast and the furious", "furious 7", "fate of the furious"],
  ["twilight"],
  ["pirates of the caribbean"],
  ["before sunrise", "before sunset", "before midnight"],
  ["kill bill"],
  ["ip man"],
  ["rocky", "creed"],
  ["planet of the apes"],
  ["top gun"],
  ["avatar"],
  ["frozen"],
  ["despicable me", "minions"],
  ["shrek"],
  ["how to train your dragon"],
  ["kung fu panda"],
  ["knives out", "glass onion", "wake up dead man"],
];

function stem(title: string) {
  return titleKey(title)
    .replace(/\b(part|chapter|episode|vol|volume)\b.+$/, "")
    .replace(/\b(ii|iii|iv|v|vi|vii|viii|ix|2|3|4|5|6)\b$/, "")
    .trim();
}

const cache = new Map<string, string>();

export function seriesKey(movie: Movie): string {
  const hit = cache.get(movie.id);
  if (hit) return hit;
  const t = titleKey(movie.title);
  const id = movie.id.replace(/-/g, " ");
  for (const group of GROUPS) {
    if (group.some((k) => t.includes(k) || id.includes(k))) {
      cache.set(movie.id, group[0]!);
      return group[0]!;
    }
  }
  const s = stem(movie.title);
  const key = s.length >= 10 && s !== t ? s : t;
  cache.set(movie.id, key);
  return key;
}

export function sameSeries(a: Movie, b: Movie) {
  if (a.id === b.id) return true;
  return seriesKey(a) === seriesKey(b);
}

export function seriesMates(movie: Movie): Movie[] {
  const key = seriesKey(movie);
  return MOVIES.filter((m) => m.id !== movie.id && seriesKey(m) === key);
}

export function vetoedSeries(ids: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const id of ids) {
    const movie = MOVIE_BY_ID[id];
    if (movie) out.add(seriesKey(movie));
  }
  return out;
}
