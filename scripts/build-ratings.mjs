#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "src/catalog/ratings.json");
const BATCH = 18;

function parseScore(raw, source) {
  const src = (source || "").toLowerCase();
  const text = String(raw);
  const pct = text.match(/(\d+(?:\.\d+)?)\s*%/);
  const over = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  const out = {};
  if (src.includes("rotten")) {
    if (pct) {
      const n = Number(pct[1]);
      if (n <= 100) out.rottenTomatoes = n;
    } else if (over && Number(over[2]) === 10) {
      out.audience = Math.round(Number(over[1]) * 10);
    } else if (over && Number(over[2]) === 100) {
      out.rottenTomatoes = Number(over[1]);
    }
  } else if (src.includes("metacritic") && over) {
    const n = (Number(over[1]) / Number(over[2])) * 100;
    if (n <= 100) out.metacritic = Math.round(n);
  } else if (src.includes("imdb") && over && Number(over[2]) === 10) {
    out.imdb = Math.round(Number(over[1]) * 10) / 10;
  }
  return out;
}

async function queryBatch(pairs) {
  const values = pairs
    .map((p) => `("${p.title.replace(/"/g, '\\"')}"@en ${p.year})`)
    .join(" ");
  const sparql = `
SELECT ?title ?year ?score ?sourceLabel WHERE {
  VALUES (?title ?year) { ${values} }
  ?film rdfs:label ?title .
  ?film wdt:P31/wdt:P279* wd:Q11424 .
  ?film wdt:P577 ?date .
  FILTER(YEAR(?date) = ?year)
  OPTIONAL {
    ?film p:P444 ?st .
    ?st ps:P444 ?score .
    OPTIONAL {
      ?st pq:P447 ?source .
      ?source rdfs:label ?sourceLabel .
      FILTER(LANG(?sourceLabel) = "en")
    }
  }
}`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  const res = await fetch(url, { headers: { accept: "application/sparql-results+json", "user-agent": "movies/1.0" } });
  if (!res.ok) throw new Error(`wikidata ${res.status}`);
  const json = await res.json();
  const byKey = new Map();
  for (const row of json.results?.bindings ?? []) {
    const title = row.title?.value;
    const year = Number(row.year?.value);
    if (!title || !year) continue;
    const key = `${title.toLowerCase()}|${year}`;
    const cur = byKey.get(key) ?? {};
    Object.assign(cur, parseScore(row.score?.value ?? "", row.sourceLabel?.value ?? ""));
    byKey.set(key, cur);
  }
  return byKey;
}

async function main() {
  const library = JSON.parse(await readFile(join(ROOT, "src/catalog/library.json"), "utf8"));
  const current = JSON.parse(await readFile(DEST, "utf8"));
  const catalog = library.map((m) => ({ id: m.id, title: m.title, year: m.year }));
  const missing = catalog.filter((m) => {
    const r = current[m.id];
    return !r || r.rottenTomatoes == null;
  });
  console.log(`[ratings] ${catalog.length} films, ${missing.length} missing RT`);
  for (let i = 0; i < missing.length; i += BATCH) {
    const slice = missing.slice(i, i + BATCH).map((m) => ({ id: m.id, title: m.title, year: m.year }));
    try {
      const found = await queryBatch(slice);
      let hit = 0;
      for (const m of slice) {
        const add = found.get(`${m.title.toLowerCase()}|${m.year}`);
        if (!add || !Object.keys(add).length) continue;
        current[m.id] = { ...(current[m.id] ?? {}), ...add };
        hit += 1;
      }
      console.log(`[ratings] ${i + slice.length}/${missing.length} (+${hit})`);
      await writeFile(DEST, `${JSON.stringify(current)}\n`);
    } catch (err) {
      console.warn(`[ratings] batch failed at ${i}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  await writeFile(DEST, `${JSON.stringify(current)}\n`);
  const withRt = Object.values(current).filter((r) => r.rottenTomatoes != null).length;
  console.log(`[ratings] wrote ${Object.keys(current).length} entries, ${withRt} with RT`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
