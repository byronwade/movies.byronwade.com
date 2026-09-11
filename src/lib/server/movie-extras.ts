import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  EMPTY_EXTRAS,
  grokPlain,
  grokSlugGuess,
  isJunkFile,
  isUsableStill,
  mergeClips,
  unique,
  wikiCandidates,
  wikiFileUrl,
  youtubeIdsIn,
  type MovieClip,
  type MovieExtras,
  type MovieFact,
  type MovieStill,
} from "@/lib/movie-extras";
import { APP_UA } from "@/lib/brand";

const Input = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number(),
  trailer: z.string().optional(),
});

const cache = new Map<string, { at: number; data: MovieExtras }>();
const TTL = 30 * 60 * 1000;
const UA = { "user-agent": `${APP_UA} (movie extras; fallbacks)`, accept: "application/json" };

function timed<T>(p: Promise<T>, ms = 1800): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(null);
      },
    );
  });
}

async function json(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

type WikiSummary = {
  title?: string;
  extract?: string;
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

type WikiMedia = {
  items?: { title?: string; type?: string; srcset?: { src?: string; scale?: string }[] }[];
};

type ItunesHit = {
  trackName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  longDescription?: string;
  shortDescription?: string;
  releaseDate?: string;
};

function largestSrc(srcset?: { src?: string; scale?: string }[]) {
  if (!srcset?.length) return "";
  const last = srcset[srcset.length - 1]?.src || srcset[0]?.src || "";
  return last.startsWith("//") ? `https:${last.split("?")[0]}` : last.split("?")[0];
}

async function wikipedia(title: string, year: number) {
  const names = wikiCandidates(title, year).slice(0, 2);
  for (const name of names) {
    const summary = (await timed(
      json(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`) as Promise<WikiSummary>,
    )) as WikiSummary | null;
    if (!summary?.title || /may refer to/i.test(summary.extract ?? "")) continue;
    const media = (await timed(
      json(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(summary.title)}`) as Promise<WikiMedia>,
    )) as WikiMedia | null;
    return { summary, media };
  }
  const search = (await timed(
    json(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(`${title} ${year} film`)}&limit=1&format=json`,
    ) as Promise<unknown>,
  )) as unknown[] | null;
  const found = Array.isArray(search) && Array.isArray(search[1]) ? String(search[1][0] ?? "") : "";
  if (!found) return null;
  const summary = (await timed(
    json(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(found)}`) as Promise<WikiSummary>,
  )) as WikiSummary | null;
  if (!summary?.title) return null;
  const media = (await timed(
    json(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(summary.title)}`) as Promise<WikiMedia>,
  )) as WikiMedia | null;
  return { summary, media };
}

async function wikidata(title: string, year: number) {
  const sparql = `SELECT DISTINCT ?yt ?image ?imdb ?rt ?composerLabel ?companyLabel WHERE {
    ?film rdfs:label "${title.replace(/"/g, "")}"@en .
    ?film wdt:P31/wdt:P279* wd:Q11424 .
    OPTIONAL { ?film wdt:P577 ?date . FILTER(YEAR(?date) = ${year}) }
    OPTIONAL { ?film wdt:P1651 ?yt }
    OPTIONAL { ?film wdt:P18 ?image }
    OPTIONAL { ?film wdt:P345 ?imdb }
    OPTIONAL { ?film wdt:P1258 ?rt }
    OPTIONAL { ?film wdt:P86 ?composer }
    OPTIONAL { ?film wdt:P272 ?company }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } LIMIT 24`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  const body = (await timed(json(url))) as {
    results?: { bindings?: Record<string, { value?: string }>[] };
  } | null;
  return body?.results?.bindings ?? [];
}

async function itunes(title: string, year: number) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(`${title} ${year}`)}&media=movie&entity=movie&limit=5&country=US`;
  const body = (await timed(json(url), 1600)) as { results?: ItunesHit[] } | null;
  const rows = body?.results ?? [];
  return rows.filter((row) => {
    const name = (row.trackName ?? "").toLowerCase();
    const y = Number((row.releaseDate ?? "").slice(0, 4));
    if (!name.includes(title.toLowerCase().slice(0, 8))) return false;
    if (y && Math.abs(y - year) > 1) return false;
    return true;
  });
}

function stillFrom(src: string): MovieStill | null {
  if (!src) return null;
  const clean = src.startsWith("//") ? `https:${src}` : src;
  if (!isUsableStill(clean)) return null;
  return { src: clean };
}

async function grokipedia(title: string, year: number) {
  const search = (await timed(
    json(
      `https://grokipedia.com/api/full-text-search?query=${encodeURIComponent(`${title} ${year} film`)}&limit=5`,
    ) as Promise<{ results?: { slug?: string; title?: string; snippet?: string }[] }>,
    1600,
  )) as { results?: { slug?: string; title?: string; snippet?: string }[] } | null;
  const rows = search?.results ?? [];
  const lower = title.toLowerCase();
  const hit =
    rows.find((r) => (r.slug ?? "").includes(String(year)) && (r.title ?? "").toLowerCase().includes(lower)) ??
    rows.find((r) => (r.title ?? "").toLowerCase().includes(lower));
  const slug = hit?.slug ?? grokSlugGuess(title, year)[0] ?? "";
  if (!slug) return null;
  const page = (await timed(
    json(`https://grokipedia.com/api/page-preview?slug=${encodeURIComponent(slug)}`) as Promise<{
      found?: boolean;
      page?: { content?: string; title?: string; images?: { url?: string; src?: string }[] };
    }>,
    2200,
  )) as {
    found?: boolean;
    page?: { content?: string; title?: string; images?: { url?: string; src?: string }[] };
  } | null;
  const content = page?.page?.content ?? "";
  return {
    slug,
    extract: grokPlain(content) || hit?.snippet || "",
    youtube: youtubeIdsIn(content),
    rotten: content.match(/rottentomatoes\.com\/(m\/[a-z0-9_]+)/i)?.[1],
    imdb: content.match(/imdb\.com\/title\/(tt\d+)/i)?.[1],
    images: (page?.page?.images ?? []).map((img) => img.url || img.src || "").filter(Boolean),
  };
}

export const pullMovieExtras = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<MovieExtras> => {
    const hit = cache.get(data.id);
    if (hit && Date.now() - hit.at < TTL) return hit.data;
    try {
      const [wiki, wd, apple, grok] = await Promise.all([
        wikipedia(data.title, data.year),
        wikidata(data.title, data.year),
        itunes(data.title, data.year),
        grokipedia(data.title, data.year),
      ]);

      const yt: string[] = [];
      const stills: MovieStill[] = [];
      const facts: MovieFact[] = [];
      let imdb: string | undefined;
      let rotten: string | undefined;
      for (const row of wd) {
        if (row.yt?.value) yt.push(row.yt.value);
        const img = row.image?.value;
        if (img) {
          const s = stillFrom(img.includes("Special:FilePath") ? img : wikiFileUrl(img.split("/").pop() ?? ""));
          if (s) stills.push(s);
        }
        if (row.imdb?.value) imdb = row.imdb.value;
        if (row.rt?.value) rotten = row.rt.value;
        if (row.composerLabel?.value) facts.push({ label: "Music", value: row.composerLabel.value });
        if (row.companyLabel?.value) facts.push({ label: "Studio", value: row.companyLabel.value });
      }

      const wikiTitle = wiki?.summary?.title ?? "";
      const extract = wiki?.summary?.extract ?? "";
      const lead = wiki?.summary?.originalimage?.source || wiki?.summary?.thumbnail?.source;
      if (lead) {
        const s = stillFrom(lead);
        if (s) stills.unshift(s);
      }
      for (const item of wiki?.media?.items ?? []) {
        if (item.type && item.type !== "image") continue;
        const title = item.title ?? "";
        if (isJunkFile(title)) continue;
        const fromSet = largestSrc(item.srcset);
        const s = stillFrom(fromSet || wikiFileUrl(title));
        if (s) stills.push(s);
      }

      if (grok?.youtube.length) yt.push(...grok.youtube);
      if (grok?.imdb && !imdb) imdb = grok.imdb;
      if (grok?.rotten && !rotten) rotten = grok.rotten;
      for (const src of grok?.images ?? []) {
        const s = stillFrom(src);
        if (s) stills.push(s);
      }

      const clips: MovieClip[] = mergeClips(data.trailer, yt);
      for (const row of apple) {
        if (row.previewUrl) {
          clips.push({
            kind: "preview",
            key: row.previewUrl,
            label: "Preview",
            thumb: row.artworkUrl100?.replace("100x100", "600x600"),
            url: row.previewUrl,
          });
        }
        const art = row.artworkUrl100?.replace("100x100", "600x600");
        if (art) {
          const s = stillFrom(art);
          if (s) stills.push(s);
        }
        if (!extract && (row.longDescription || row.shortDescription)) {
          facts.push({ label: "iTunes", value: (row.longDescription || row.shortDescription || "").slice(0, 240) });
        }
      }

      const extras: MovieExtras = {
        clips: unique(clips, (c) => c.key).slice(0, 8),
        stills: unique(stills, (s) => s.src).slice(0, 14),
        extract: extract.slice(0, 900),
        grokExtract: grok?.extract ?? "",
        grokSlug: grok?.slug ?? "",
        facts: unique(facts, (f) => `${f.label}:${f.value}`).slice(0, 8),
        wikiTitle,
        imdb,
        rotten,
      };
      cache.set(data.id, { at: Date.now(), data: extras });
      return extras;
    } catch {
      const fallback: MovieExtras = {
        ...EMPTY_EXTRAS,
        clips: mergeClips(data.trailer, []),
      };
      return fallback;
    }
  });
