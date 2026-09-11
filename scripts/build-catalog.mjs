#!/usr/bin/env node
/**
 * Builds src/catalog/library.json from Wikipedia movie-data (posters + extracts).
 * Core handcrafted films in movies.ts stay authoritative on title+year collisions.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DECADES = ["1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
const PER_DECADE = 280;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const GENRE_MAP = {
  "sci-fi": "Science Fiction",
  "science fiction": "Science Fiction",
  "sci fi": "Science Fiction",
  animated: "Animation",
  anime: "Animation",
  "martial arts": "Action",
  superhero: "Action",
  biographical: "Drama",
  biography: "Drama",
  "rom-com": "Romance",
  "romantic comedy": "Romance",
  "romantic drama": "Romance",
  romcom: "Romance",
  musical: "Musical",
  war: "War",
  western: "Western",
  sport: "Sport",
  sports: "Sport",
  crime: "Crime",
  thriller: "Thriller",
  horror: "Horror",
  comedy: "Comedy",
  drama: "Drama",
  action: "Action",
  adventure: "Adventure",
  fantasy: "Fantasy",
  mystery: "Mystery",
  family: "Family",
  documentary: "Documentary",
  romance: "Romance",
  history: "History",
  historical: "History",
  independent: "Drama",
  indie: "Drama",
  "period piece": "Drama",
  "period drama": "Drama",
  "psychological thriller": "Thriller",
  "psychological horror": "Horror",
  "dark comedy": "Comedy",
  "action comedy": "Action",
  "family comedy": "Comedy",
  "children": "Family",
  "children's": "Family",
  "christmas": "Family",
};

const THEMES = {
  "Science Fiction": ["technology", "future", "identity"],
  Horror: ["fear", "the unknown", "survival"],
  Drama: ["family", "power", "memory"],
  Comedy: ["friendship", "status", "desire"],
  Action: ["survival", "justice", "pursuit"],
  Thriller: ["paranoia", "power", "pursuit"],
  Crime: ["guilt", "power", "loyalty"],
  Romance: ["desire", "love", "class"],
  Animation: ["wonder", "family", "identity"],
  Fantasy: ["wonder", "myth", "power"],
  Mystery: ["truth", "memory", "guilt"],
  Adventure: ["journey", "survival", "wonder"],
  War: ["duty", "loss", "brotherhood"],
  Western: ["justice", "wilderness", "honor"],
  Musical: ["ambition", "love", "performance"],
  Family: ["family", "growing up", "home"],
  Documentary: ["truth", "witness", "history"],
  History: ["power", "memory", "duty"],
  Sport: ["ambition", "body", "team"],
};

const TONES = {
  "Science Fiction": ["cerebral", "atmospheric"],
  Horror: ["dread", "tense"],
  Drama: ["solemn", "tender"],
  Comedy: ["brisk", "funny"],
  Action: ["operatic", "tense"],
  Thriller: ["tense", "paranoid"],
  Crime: ["noir", "tense"],
  Romance: ["tender", "lyrical"],
  Animation: ["wondrous", "brisk"],
  Fantasy: ["epic", "lyrical"],
  Mystery: ["cerebral", "solemn"],
  Adventure: ["epic", "brisk"],
  War: ["solemn", "monumental"],
  Western: ["dusty", "solemn"],
  Musical: ["lush", "tender"],
  Family: ["warm", "brisk"],
  Documentary: ["observant", "solemn"],
  History: ["monumental", "solemn"],
  Sport: ["brisk", "tense"],
};

const MOODS = {
  "Science Fiction": ["awe", "uncanny"],
  Horror: ["dread", "quiet"],
  Drama: ["melancholy", "intimate"],
  Comedy: ["fun", "bright"],
  Action: ["intense", "loud"],
  Thriller: ["tense", "night"],
  Crime: ["night", "cold"],
  Romance: ["warm", "intimate"],
  Animation: ["wonder", "fun"],
  Fantasy: ["awe", "wonder"],
  Mystery: ["fog", "quiet"],
  Adventure: ["awe", "fun"],
  War: ["somber", "vast"],
  Western: ["dust", "vast"],
  Musical: ["lush", "warm"],
  Family: ["warm", "fun"],
  Documentary: ["quiet", "clear"],
  History: ["vast", "somber"],
  Sport: ["intense", "bright"],
};

const ATM = {
  "Science Fiction": "void",
  Horror: "woods",
  Drama: "fog",
  Comedy: "sun",
  Action: "blast",
  Thriller: "corridor",
  Crime: "night-la",
  Romance: "peach",
  Animation: "bathhouse",
  Fantasy: "gem",
  Mystery: "foghorn",
  Adventure: "dune",
  War: "dust",
  Western: "dust",
  Musical: "stage",
  Family: "lawn",
  Documentary: "glass",
  History: "stairs",
  Sport: "blast",
};

const LANG_HINT = [
  [/south korean|korean-language|korean film/i, "ko"],
  [/japanese(?:-language)? film|anime/i, "ja"],
  [/french(?:-language)? film|french drama|french comedy/i, "fr"],
  [/italian(?:-language)? film/i, "it"],
  [/spanish(?:-language)? film|mexican film/i, "es"],
  [/german(?:-language)? film/i, "de"],
  [/swedish(?:-language)? film/i, "sv"],
  [/danish(?:-language)? film/i, "da"],
  [/hindi(?:-language)? film|bollywood/i, "hi"],
  [/mandarin|chinese(?:-language)? film/i, "zh"],
  [/portuguese(?:-language)? film|brazilian film/i, "pt"],
  [/russian(?:-language)? film/i, "ru"],
  [/iranian film|persian(?:-language)?/i, "fa"],
  [/polish(?:-language)? film/i, "pl"],
  [/turkish(?:-language)? film/i, "tr"],
];

function wikiFile(url) {
  if (!url || typeof url !== "string") return null;
  if (!/^https:\/\/upload\.wikimedia\.org\//.test(url)) return null;
  if (/logo|wordmark|icon|flag|seal|svg/i.test(url)) return null;
  try {
    const u = new URL(url);
    const thumb = u.pathname.match(/^(\/wikipedia\/[^/]+\/)thumb\/(.+)\/\d+px-(.+)$/);
    if (thumb) return `${u.origin}${thumb[1]}${thumb[2]}`;
    return url;
  } catch {
    return null;
  }
}

function slugify(title, year) {
  const s = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${s || "film"}-${year}`;
}

function mapGenre(g) {
  const k = String(g || "")
    .toLowerCase()
    .replace(/ film$/i, "")
    .trim();
  if (!k) return null;
  if (GENRE_MAP[k]) return GENRE_MAP[k];
  const named = k.replace(/\b\w/g, (c) => c.toUpperCase());
  if (["Science Fiction", "Horror", "Drama", "Comedy", "Action", "Thriller", "Crime", "Romance", "Animation", "Fantasy", "Mystery", "Adventure", "War", "Western", "Musical", "Family", "Documentary", "History", "Sport"].includes(named)) {
    return named;
  }
  return null;
}

function directorOf(extract) {
  const m = extract.match(/directed by ([^.]+?)(?:\s+who\b|\s+and\s+(?:written|produced|starring)|\s+from\b|,|\.|$)/i);
  if (!m) return "";
  const name = m[1]
    .replace(/\s+in (?:his|her|their)\b.*/i, "")
    .replace(/\s+(?:in|with|for)\b.*/i, "")
    .replace(/\s+and\s+(?:distributed|produced|written|released|starring)\b.*/i, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const parts = name.split(" ").filter((p) => /^[A-ZÀ-ÖØ-ÿ]/.test(p) || /^(de|da|del|von|van|der|di|la|le|el|du|bin|al)$/i.test(p));
  if (parts.length < 2 || parts.length > 6) return parts.length === 1 ? "" : parts.slice(0, 4).join(" ");
  if (!/^[A-ZÀ-ÖØ-ÿ]/.test(parts[0])) return "";
  return parts.join(" ");
}

function runtimeOf(extract) {
  const m = extract.match(/(\d{2,3})-minute|(\d{2,3}) minutes/);
  const n = Number(m?.[1] || m?.[2] || 0);
  return n >= 40 && n <= 280 ? n : 110;
}

function languageOf(extract) {
  for (const [re, code] of LANG_HINT) if (re.test(extract)) return code;
  return "en";
}

function overviewOf(extract) {
  const cut = extract.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
  return cut.length > 320 ? `${cut.slice(0, 317).replace(/\s+\S*$/, "")}…` : cut;
}

function isTv(row) {
  const bag = `${row.title} ${(row.genres || []).join(" ")} ${row.extract || ""}`;
  return /television series|\btv series\b|sitcom|animated series|game show|miniseries|web series|talk show/i.test(bag);
}

function qualityOf(row) {
  const extract = row.extract || "";
  const thumb = row.thumbnail || "";
  let q = 0.52;
  q += Math.min(0.22, extract.length / 1800);
  if (/academy award|palmes d'or|palme d'or|oscar/i.test(extract)) q += 0.08;
  if (/poster/i.test(thumb)) q += 0.04;
  q += Math.min(0.08, (row.cast?.length ?? 0) / 80);
  return Math.max(0.42, Math.min(0.94, q));
}

function popularityOf(row) {
  let p = 0.28;
  p += Math.min(0.4, (row.extract?.length ?? 0) / 2000);
  p += Math.min(0.18, (row.cast?.length ?? 0) / 40);
  return Math.max(0.2, Math.min(0.95, p));
}

const CANON = [
  "lord of the rings",
  "the hobbit",
  "star wars",
  "harry potter",
  "the godfather",
  "the dark knight",
  "batman begins",
  "the shawshank redemption",
  "pulp fiction",
  "forrest gump",
  "inception",
  "jurassic park",
  "jurassic world",
  "titanic",
  "avatar",
  "gladiator",
  "raiders of the lost ark",
  "indiana jones",
  "back to the future",
  "the lion king",
  "toy story",
  "spider-man",
  "the avengers",
  "avengers:",
  "jaws",
  "e.t. the extra",
  "fight club",
  "the silence of the lambs",
  "goodfellas",
  "casablanca",
  "the wizard of oz",
  "schindler's list",
  "saving private ryan",
  "the social network",
  "la la land",
  "into the spider-verse",
  "the matrix",
  "terminator",
  "alien",
  "blade runner",
  "die hard",
  "home alone",
  "frozen",
  "moana",
  "shrek",
  "finding nemo",
  "the incredibles",
  "up (2009)",
  "coco",
  "spirited away",
  "my neighbor totoro",
  "princess mononoke",
  "howl's moving castle",
  "the pianist",
  "whiplash",
  "parasite",
  "everything everywhere",
  "dune",
  "interstellar",
  "oppenheimer",
  "barbie",
  "top gun",
  "mission: impossible",
  "pirates of the caribbean",
  "the hunger games",
  "twilight",
  "the notebook",
  "pretty woman",
  "dirty dancing",
  "grease",
  "rocky",
  "raging bull",
  "taxi driver",
  "good will hunting",
  "a beautiful mind",
  "the departed",
  "no country for old men",
  "there will be blood",
  "mad max",
  "john wick",
  "the wolf of wall street",
  "catch me if you can",
  "cast away",
  "the green mile",
  "se7en",
  "the prestige",
  "memento",
  "eternal sunshine",
  "her",
  "arrival",
  "gravity",
  "the martian",
  "wall-e",
  "inside out",
  "ratatouille",
  "monsters, inc",
  "beauty and the beast",
  "aladdin",
  "the little mermaid",
  "frozen",
  "encanto",
  "black panther",
  "iron man",
  "guardians of the galaxy",
  "doctor strange",
  "captain america",
  "thor",
  "wonder woman",
  "the batman",
  "joker",
  "it ",
  "the conjuring",
  "get out",
  "a quiet place",
  "scream",
  "halloween",
  "the exorcist",
  "the shining",
  "psycho",
  "gone with the wind",
  "citizen kane",
  "12 angry men",
  "it's a wonderful life",
  "rear window",
  "vertigo",
  "north by northwest",
  "lawrence of arabia",
  "ben-hur",
  "the sound of music",
  "west side story",
  "singin' in the rain",
  "amadeus",
  "braveheart",
  "the notebook",
  "pride & prejudice",
  "pride and prejudice",
  "little women",
  "clueless",
  "10 things i hate about you",
  "mean girls",
  "legally blonde",
  "bridesmaids",
  "superbad",
  "anchorman",
  "the hangover",
  "dumb and dumber",
  "groundhog day",
  "when harry met sally",
  "sleepless in seattle",
  "notting hill",
  "love actually",
];

function isCanon(row) {
  const t = String(row.title || "").toLowerCase();
  return CANON.some((c) => t.includes(c));
}

async function loadDecade(decade) {
  const url = `https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies-${decade}.json`;
  const res = await fetch(url, { headers: { "user-agent": "movies-catalog/1.0" } });
  if (!res.ok) throw new Error(`${decade} ${res.status}`);
  return res.json();
}

function toMovie(row, used) {
  const extract = row.extract || "";
  const director = directorOf(extract);
  if (!director) return null;
  const year = Number(row.year);
  if (!year || year < 1930 || year > 2026) return null;
  const genres = [...new Set((row.genres || []).map(mapGenre).filter(Boolean))];
  if (!genres.length) return null;
  let id = slugify(row.title, year);
  if (used.has(id) || used.has(`${row.title.toLowerCase()}|${year}`)) return null;
  const primary = genres[0];
  const familyish = genres.includes("Animation") || genres.includes("Family");
  const kids = /children|kids|family/i.test((row.genres || []).join(" ")) && familyish;
  const adultTone = genres.some((g) => ["Horror", "Crime", "Thriller", "War"].includes(g)) && !familyish;
  const certification = kids ? "PG" : familyish ? "PG" : adultTone ? "R" : "PG-13";
  const audience = kids && familyish ? "kids" : familyish ? "family" : "adult";
  const cast = (row.cast || [])
    .filter((n) => typeof n === "string" && n.length > 1 && !/^\d+$/.test(n) && n !== ")")
    .slice(0, 4)
    .map((name) => ({ name, role: "" }));
  if (!cast.length) return null;
  const poster = wikiFile(row.thumbnail);
  if (!poster) return null;
  return {
    id,
    slug: id,
    title: row.title,
    year,
    runtimeMin: runtimeOf(extract),
    certification,
    genres: genres.slice(0, 4),
    themes: (THEMES[primary] ?? ["identity", "power"]).slice(0, 4),
    tones: (TONES[primary] ?? ["solemn"]).slice(0, 3),
    moods: (MOODS[primary] ?? ["quiet"]).slice(0, 3),
    director,
    writers: [director],
    cast,
    overview: overviewOf(extract) || `${row.title} (${year}).`,
    quality: Math.round(qualityOf(row) * 100) / 100,
    popularity: Math.round(popularityOf(row) * 100) / 100,
    atmosphere: ATM[primary] ?? "fog",
    audience,
    language: languageOf(extract),
    similarIds: [],
    watch: [{ provider: "Rent", included: false }],
    poster,
    backdrop: poster,
  };
}

function similarIds(movies) {
  const byGenre = new Map();
  for (const m of movies) {
    for (const g of m.genres) {
      if (!byGenre.has(g)) byGenre.set(g, []);
      byGenre.get(g).push(m);
    }
  }
  for (const m of movies) {
    const scores = new Map();
    for (const g of m.genres) {
      for (const o of byGenre.get(g) ?? []) {
        if (o.id === m.id) continue;
        scores.set(o.id, (scores.get(o.id) ?? 0) + 1 + (o.director === m.director ? 1.5 : 0));
      }
    }
    m.similarIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1] || 0)
      .slice(0, 4)
      .map(([id]) => id);
  }
}

async function main() {
  const used = new Set();
  const out = [];
  for (const decade of DECADES) {
    const rows = await loadDecade(decade);
    const ranked = rows
      .filter((r) => r?.title && r.thumbnail && r.extract && !isTv(r) && wikiFile(r.thumbnail))
      .map((r) => {
        const directed = /directed by /i.test(r.extract) ? 1 : 0;
        const poster = /wikipedia\/en\//.test(r.thumbnail) ? 1 : 0;
        const named = r.extract.startsWith(r.title) ? 1 : 0;
        const award = /academy award|oscar|palme d'or|golden globe|best picture/i.test(r.extract) ? 1 : 0;
        const score =
          Math.min(r.extract.length, 400) +
          Math.min(r.cast?.length ?? 0, 8) * 10 +
          directed * 180 +
          poster * 220 +
          named * 80 +
          award * 260 +
          (isCanon(r) ? 4000 : 0);
        return { r, score };
      })
      .sort((a, b) => b.score - a.score);
    let added = 0;
    for (const { r } of ranked) {
      if (added >= PER_DECADE) break;
      const movie = toMovie(r, used);
      if (!movie) continue;
      used.add(movie.id);
      used.add(`${movie.title.toLowerCase()}|${movie.year}`);
      out.push(movie);
      added += 1;
    }
    console.log(`[catalog] ${decade}: ${added}`);
  }
  similarIds(out);
  const dest = join(ROOT, "src/catalog/library.json");
  await writeFile(dest, JSON.stringify(out));
  console.log(`[catalog] wrote ${out.length} films → src/catalog/library.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
