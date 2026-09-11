export type MovieClip = {
  kind: "youtube" | "preview";
  key: string;
  label: string;
  thumb?: string;
  url?: string;
};

export type MovieStill = { src: string };

export type MovieFact = { label: string; value: string };

export type MovieExtras = {
  clips: MovieClip[];
  stills: MovieStill[];
  extract: string;
  grokExtract: string;
  grokSlug: string;
  facts: MovieFact[];
  wikiTitle: string;
  imdb?: string;
  rotten?: string;
};

export const EMPTY_EXTRAS: MovieExtras = {
  clips: [],
  stills: [],
  extract: "",
  grokExtract: "",
  grokSlug: "",
  facts: [],
  wikiTitle: "",
};

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function wikiFileUrl(title: string) {
  const name = title.replace(/^File:/i, "").trim();
  if (!name) return "";
  return `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=800`;
}

export function isUsableStill(src: string) {
  if (!src || src.length < 12) return false;
  if (/thumb\.wikimedia\.org\/.+\/(\d{1,2}|1\d{2})px-/i.test(src)) return false;
  if (/maxresdefault\.jpg/i.test(src)) return false;
  return /upload\.wikimedia\.org|image\.tmdb\.org|mzstatic\.com|ytimg\.com\/vi\/[^/]+\/hqdefault|wikipedia\.org\/wiki\/Special:FilePath/i.test(
    src,
  );
}

export function isYoutubeId(id: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

export function isJunkFile(title: string) {
  return /(?:\.svg$|icon|logo|flag|wiki|speaker|padlock|symbol|question|commons-logo|edit-clear|ambox)/i.test(title);
}

export function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export function mergeClips(catalogId: string | undefined, extras: string[]) {
  const ids = unique(
    [catalogId, ...extras].filter((id): id is string => Boolean(id && isYoutubeId(id))),
    (id) => id,
  );
  return ids.map((id, i) => ({
    kind: "youtube" as const,
    key: id,
    label: i === 0 ? "Trailer" : i === 1 ? "Teaser" : `Trailer ${i + 1}`,
    thumb: youtubeThumb(id),
  }));
}

export function wikiCandidates(title: string, year: number) {
  const clean = title.replace(/:/g, "");
  return [`${title} (${year} film)`, `${title} (film)`, `${clean} (${year} film)`, title];
}

export function grokSlugGuess(title: string, year: number) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return [`${slug}_${year}_film`, `${slug}_film`, slug];
}

export function grokPlain(md: string) {
  const intro = md.split(/\n##\s/)[0] ?? md;
  return intro
    .replace(/^\s*#+\s.+\n+/, "")
    .replace(/\[\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 720);
}

export function youtubeIdsIn(text: string) {
  const found = text.match(/youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/g) ?? [];
  return unique(
    found.map((m) => m.slice(-11)).filter((id) => isYoutubeId(id)),
    (id) => id,
  );
}
