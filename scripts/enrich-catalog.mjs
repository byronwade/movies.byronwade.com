#!/usr/bin/env node
/**
 * Adds Wikidata trailers (P1651) and Commons originals (P18) to library.json.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "src/catalog/library.json");
const BATCH = 16;

function filePath(raw) {
  if (!raw) return null;
  const text = String(raw);
  if (/^https?:\/\//.test(text)) {
    try {
      const u = new URL(text.replace(/^http:/, "https:"));
      if (u.pathname.includes("Special:FilePath/")) {
        u.search = "";
        u.hash = "";
        return u.toString();
      }
      const thumb = u.pathname.match(/^(\/wikipedia\/[^/]+\/)thumb\/(.+)\/\d+px-(.+)$/);
      if (thumb) return `${u.origin}${thumb[1]}${thumb[2]}`;
      return u.toString();
    } catch {
      return null;
    }
  }
  const name = text.replace(/^File:/i, "").trim();
  if (!name) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`;
}

async function queryBatch(pairs) {
  const values = pairs
    .map((p) => `("${p.title.replace(/"/g, '\\"')}"@en ${p.year})`)
    .join(" ");
  const sparql = `
SELECT ?title ?year ?youtube ?image WHERE {
  VALUES (?title ?year) { ${values} }
  ?film rdfs:label ?title .
  ?film wdt:P31/wdt:P279* wd:Q11424 .
  ?film wdt:P577 ?date .
  FILTER(YEAR(?date) = ?year)
  OPTIONAL { ?film wdt:P1651 ?youtube }
  OPTIONAL { ?film wdt:P18 ?image }
}`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  const res = await fetch(url, {
    headers: { accept: "application/sparql-results+json", "user-agent": "movies/1.0" },
  });
  if (!res.ok) throw new Error(`wikidata ${res.status}`);
  const json = await res.json();
  const byKey = new Map();
  for (const row of json.results?.bindings ?? []) {
    const title = row.title?.value;
    const year = Number(row.year?.value);
    if (!title || !year) continue;
    const key = `${title.toLowerCase()}|${year}`;
    const cur = byKey.get(key) ?? {};
    if (row.youtube?.value) cur.youtube = row.youtube.value;
    if (row.image?.value) cur.image = filePath(row.image.value);
    byKey.set(key, cur);
  }
  return byKey;
}

async function main() {
  const library = JSON.parse(await readFile(DEST, "utf8"));
  let enriched = 0;
  let trailers = 0;
  for (let i = 0; i < library.length; i += BATCH) {
    const chunk = library.slice(i, i + BATCH);
    let hits = new Map();
    try {
      hits = await queryBatch(chunk.map((m) => ({ title: m.title, year: m.year })));
    } catch (err) {
      console.warn(`[enrich] batch ${i} failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    for (const movie of chunk) {
      const hit = hits.get(`${movie.title.toLowerCase()}|${movie.year}`);
      if (!hit) continue;
      if (hit.youtube && !movie.trailerYoutubeId) {
        movie.trailerYoutubeId = hit.youtube;
        trailers += 1;
      }
      if (hit.image) {
        movie.poster = hit.image;
        movie.backdrop = hit.image;
        enriched += 1;
      }
    }
    process.stdout.write(`[enrich] ${Math.min(i + BATCH, library.length)}/${library.length}\r`);
    await new Promise((r) => setTimeout(r, 250));
  }
  await writeFile(DEST, JSON.stringify(library));
  console.log(`\n[enrich] posters ${enriched}  trailers ${trailers}  films ${library.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
