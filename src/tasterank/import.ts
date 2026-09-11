import { MOVIES } from "../catalog/movies.ts";
import type { Movie } from "../catalog/types.ts";

export type ImportHit = {
  movieId: string;
  title: string;
  action: "import_seen" | "import_watchlist";
  source: "netflix" | "letterboxd" | "list" | "mail";
  year?: number;
  rating?: number;
};

const ALIAS: Record<string, string> = {
  "dune 2": "dune-part-two",
  "dune: part two": "dune-part-two",
  "dune part two": "dune-part-two",
  "blade runner 2049": "blade-runner-2049",
  "mad max fury road": "mad-max-fury-road",
  "no country": "no-country-for-old-men",
  "there will be blood": "there-will-be-blood",
  "spirited away": "spirited-away",
  "howls moving castle": "howls-moving-castle",
  "howl's moving castle": "howls-moving-castle",
  "the matrix": "the-matrix",
  "ex machina": "ex-machina",
  "everything everywhere all at once": "everything-everywhere",
  "portrait of a lady on fire": "portrait-of-a-lady-on-fire",
  "the iron giant": "the-iron-giant",
  "paddington 2": "paddington-2",
  "the incredibles": "the-incredibles",
};

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[:''']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchTitle(raw: string, year?: number): Movie | undefined {
  const n = norm(raw);
  if (!n || n.length < 2) return undefined;
  const alias = ALIAS[n] ?? ALIAS[raw.toLowerCase().trim()];
  if (alias) return MOVIES.find((m) => m.id === alias);
  const candidates = MOVIES.filter((m) => {
    const t = norm(m.title);
    if (t === n) return true;
    if (n.startsWith(t + " ") || t.startsWith(n + " ")) return true;
    return false;
  });
  if (year) {
    const y = candidates.find((m) => Math.abs(m.year - year) <= 1);
    if (y) return y;
  }
  if (candidates.length === 1) return candidates[0];
  return candidates.sort((a, b) => b.popularity - a.popularity)[0];
}

function matchFlexible(title: string, year?: number): Movie | undefined {
  const full = matchTitle(title, year);
  if (full) return full;
  const series = title.replace(/\s*[:\-–]\s*(season|series|chapter|episode|vol\.?|part)\b.*/i, "").trim();
  if (series && series !== title) return matchTitle(series, year);
  return undefined;
}

export function parseNetflixCsv(text: string): ImportHit[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const hits: ImportHit[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (/^title\s*,/i.test(line)) continue;
    const m = line.match(/^"([^"]+)"|^([^,]+)/);
    const title = (m?.[1] || m?.[2] || "").trim();
    if (!title) continue;
    const movie = matchFlexible(title);
    if (!movie || seen.has(movie.id)) continue;
    seen.add(movie.id);
    hits.push({ movieId: movie.id, title: movie.title, action: "import_seen", source: "netflix" });
  }
  return hits;
}

export function parseLetterboxdCsv(text: string): ImportHit[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0]?.toLowerCase() ?? "";
  const isLb = header.includes("name") && (header.includes("letterboxd") || header.includes("year") || header.includes("rating"));
  const watchlist = header.includes("watchlist") || (isLb && !header.includes("rating") && !header.includes("watched"));
  const hits: ImportHit[] = [];
  const seen = new Set<string>();
  const start = isLb || header.includes("date") ? 1 : 0;
  for (const line of lines.slice(start)) {
    const cols = splitCsv(line);
    if (cols.length < 2) continue;
    const name = isLb ? cols[1] : cols[0];
    const year = Number(isLb ? cols[2] : cols[1]) || undefined;
    const rating = isLb ? Number(cols[4]) : undefined;
    if (!name) continue;
    const movie = matchTitle(name, year);
    if (!movie || seen.has(movie.id)) continue;
    seen.add(movie.id);
    hits.push({
      movieId: movie.id,
      title: movie.title,
      action: watchlist ? "import_watchlist" : "import_seen",
      source: "letterboxd",
      year: movie.year,
      rating: Number.isFinite(rating) ? rating : undefined,
    });
  }
  return hits;
}

export function parsePastedTitles(text: string): ImportHit[] {
  const parts = text.split(/[\n,;]+/).map((s) => s.trim()).filter((s) => s.length > 1);
  const hits: ImportHit[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const year = Number((p.match(/(19|20)\d{2}/) || [])[0]) || undefined;
    const movie = matchTitle(p.replace(/\(?(19|20)\d{2}\)?/g, "").trim(), year);
    if (!movie || seen.has(movie.id)) continue;
    seen.add(movie.id);
    hits.push({ movieId: movie.id, title: movie.title, action: "import_seen", source: "list" });
  }
  return hits;
}

export function detectImportKind(text: string): "netflix" | "letterboxd" | "list" {
  const head = text.slice(0, 240).toLowerCase();
  if (head.includes("letterboxd") || (head.includes("name") && head.includes("rating") && head.includes("year"))) {
    return "letterboxd";
  }
  if (/title\s*,\s*date/i.test(head) || head.includes("netflix")) return "netflix";
  if (head.includes(",") && head.split("\n").length > 3 && /date/i.test(head) && !head.includes("name,")) return "netflix";
  return "list";
}

export function parseImportText(text: string): ImportHit[] {
  const kind = detectImportKind(text);
  if (kind === "netflix") return parseNetflixCsv(text);
  if (kind === "letterboxd") return parseLetterboxdCsv(text);
  return parsePastedTitles(text);
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') {
      q = !q;
      continue;
    }
    if (ch === "," && !q) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function letterboxdUsername(raw: string): string | null {
  const t = raw.trim();
  const url = t.match(/letterboxd\.com\/([a-zA-Z0-9_]+)/i);
  if (url) return url[1]!.toLowerCase();
  if (/^@?[a-zA-Z0-9_]{2,30}$/.test(t) && !matchTitle(t.replace(/^@/, ""))) {
    return t.replace(/^@/, "").toLowerCase();
  }
  return null;
}

export function parseLetterboxdRss(xml: string): string[] {
  const titles: string[] = [];
  const re = /<title>([^<]+)<\/title>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const raw = m[1]!.replace(/,?\s*(19|20)\d{2}.*/, "").replace(/\s*[-–].*/, "").trim();
    if (raw && !/letterboxd/i.test(raw)) titles.push(raw);
  }
  return titles;
}

export function extractMailText(data: unknown): string {
  const parts: string[] = [];
  const walk = (value: unknown, depth = 0) => {
    if (depth > 8 || value == null) return;
    if (typeof value === "string") {
      const t = value.trim();
      if (t.length > 1 && t.length < 8000) parts.push(t);
      return;
    }
    if (typeof value === "number" || typeof value === "boolean") return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
      return;
    }
    if (typeof value === "object") {
      const rec = value as Record<string, unknown>;
      for (const key of ["subject", "snippet", "body_preview", "bodyPreview", "text", "title"]) {
        if (typeof rec[key] === "string") parts.push(rec[key]);
      }
      for (const item of Object.values(rec)) walk(item, depth + 1);
    }
  };
  walk(data);
  return parts.join("\n");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Map Gmail search / message payloads onto catalog titles. */
export function parseMailLibrary(data: unknown): ImportHit[] {
  const text = extractMailText(data);
  if (!text.trim()) return [];
  const hits: ImportHit[] = [];
  const seen = new Set<string>();
  for (const movie of MOVIES) {
    const titleRe = escapeRe(movie.title);
    const re =
      movie.title.length < 5
        ? new RegExp(`\\b${titleRe}\\b\\s*\\(?${movie.year}`, "i")
        : new RegExp(`\\b${titleRe}\\b`, "i");
    if (!re.test(text) || seen.has(movie.id)) continue;
    seen.add(movie.id);
    hits.push({ movieId: movie.id, title: movie.title, action: "import_seen", source: "mail" });
  }
  return hits;
}
