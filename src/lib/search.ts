import type { Movie } from "@/catalog/types";

const ALIASES: Record<string, string[]> = {
  lotr: ["lord of the rings", "fellowship of the ring", "two towers", "return of the king"],
  "lord of the rings": ["fellowship of the ring", "two towers", "return of the king", "hobbit"],
  rotk: ["return of the king"],
  "two towers": ["the two towers"],
  fellowship: ["fellowship of the ring"],
  hp: ["harry potter"],
  potter: ["harry potter"],
  tdk: ["dark knight"],
  sw: ["star wars"],
  "star wars": ["empire strikes back", "return of the jedi", "a new hope"],
  "new hope": ["star wars"],
  godfather: ["the godfather"],
  shawshank: ["shawshank redemption"],
  inception: ["inception"],
  jurassic: ["jurassic park", "jurassic world"],
};

export function normalizeQuery(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokensOf(s: string) {
  return s.split(" ").filter((t) => t.length > 0);
}

function expand(query: string) {
  const extra = ALIASES[query] ?? [];
  const out = new Set([query, ...extra]);
  for (const [key, vals] of Object.entries(ALIASES)) {
    if (query.includes(key) || key.includes(query)) {
      out.add(key);
      for (const v of vals) out.add(v);
    }
  }
  return [...out];
}

function haystack(movie: Movie) {
  return normalizeQuery(
    `${movie.title} ${movie.year} ${movie.director} ${movie.cast.map((c) => c.name).join(" ")} ${movie.genres.join(" ")} ${movie.themes.join(" ")}`,
  );
}

export function scoreMovie(movie: Movie, raw: string) {
  const q = normalizeQuery(raw);
  if (!q) return 0;
  const title = normalizeQuery(movie.title);
  const year = String(movie.year);
  const phrases = expand(q);
  const tokens = tokensOf(q);
  let score = 0;

  if (title === q) score += 120;
  if (title.startsWith(q)) score += 80;
  if (title.includes(q)) score += 70;
  for (const phrase of phrases) {
    if (phrase === q) continue;
    if (title === phrase) score += 90;
    else if (title.includes(phrase)) score += 60;
  }
  if (tokens.length > 1 && tokens.every((t) => title.includes(t))) score += 55;
  else if (tokens.some((t) => t.length > 2 && title.includes(t))) score += 20;

  const bag = haystack(movie);
  if (bag.includes(q)) score += 12;
  if (tokens.every((t) => bag.includes(t))) score += 18;
  if (year === q || tokens.includes(year)) score += 10;
  const director = normalizeQuery(movie.director);
  if (q.length > 2 && director.includes(q)) score += 28;
  for (const person of movie.cast) {
    if (normalizeQuery(person.name).includes(q)) score += 22;
  }
  score += movie.popularity * 8 + movie.quality * 4;
  return score;
}

export function searchMovies(movies: Movie[], raw: string, limit = 80) {
  const q = normalizeQuery(raw);
  if (!q) return [];
  const scored = [];
  for (const movie of movies) {
    const score = scoreMovie(movie, raw);
    if (score < 18) continue;
    scored.push({ movie, score });
  }
  scored.sort((a, b) => b.score - a.score || b.movie.year - a.movie.year);
  return scored.slice(0, limit).map((row) => row.movie);
}
