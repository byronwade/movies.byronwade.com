import type { TasteNode, TasteProfile } from "./types.ts";

function group(taste: TasteProfile, prefix: string, kind: TasteNode["kind"], limit = 8, min = 0.12): TasteNode[] {
  return Object.entries(taste.affinities)
    .filter(([k, v]) => k.startsWith(prefix) && Math.abs(v) > min)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, limit)
    .map(([key, value]) => ({
      key,
      name: pretty(key.slice(prefix.length)),
      value: Math.round(value * 100) / 100,
      kind,
    }));
}

function pretty(raw: string) {
  return raw.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function signatureLabel(genres: TasteNode[], themes: TasteNode[], tones: TasteNode[], moods: TasteNode[]) {
  const g = (genres[0]?.name ?? "").toLowerCase();
  const bag = new Set([...themes, ...tones, ...moods].map((n) => n.name.toLowerCase()));
  if (g.includes("science") && (bag.has("Cosmic Horror".toLowerCase()) || bag.has("alien biology") || bag.has("dread"))) {
    return "Dark sci-fi";
  }
  if (g.includes("science") && (bag.has("power") || bag.has("prophecy") || bag.has("ecology"))) {
    return "Epic sci-fi";
  }
  if (g.includes("science") && (bag.has("language") || bag.has("first contact") || bag.has("ai"))) {
    return "Cerebral sci-fi";
  }
  if (g.includes("horror")) return "Horror";
  if (g.includes("animation") || g.includes("fantasy")) return "Wonder";
  if (g.includes("crime") || g.includes("thriller")) return "Crime & tension";
  if (g.includes("comedy")) return "Comedy";
  if (g.includes("romance")) return "Romance";
  if (g.includes("drama") && bag.has("family")) return "Family drama";
  if (genres[0]) return genres[0].name;
  if (themes[0]) return themes[0].name;
  return "You";
}

function branch(key: string, name: string, kind: TasteNode["kind"], children: TasteNode[]): TasteNode | null {
  if (!children.length) return null;
  return { key, name, value: children[0]!.value, kind, children };
}

export function tasteGraph(taste: TasteProfile): TasteNode[] {
  const genres = group(taste, "genre:", "genre", 8);
  const themes = group(taste, "theme:", "theme", 10);
  const tones = group(taste, "tone:", "tone", 8);
  const moods = group(taste, "mood:", "mood", 8);
  const directors = group(taste, "director:", "person", 6);
  const actors = group(taste, "actor:", "person", 6);
  const people = [...directors, ...actors].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10);
  const eras = group(taste, "year:", "era", 6);
  const craft = [
    ...group(taste, "rt:", "craft", 4, 0.08),
    ...group(taste, "imdb:", "craft", 3, 0.08),
    ...group(taste, "meta:", "craft", 2, 0.08),
  ].slice(0, 6);
  const negative = Object.entries(taste.affinities)
    .filter(([, v]) => v < -0.2)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 8)
    .map(([key, value]) => ({
      key,
      name: pretty(key.split(":")[1] ?? key),
      value: Math.round(value * 100) / 100,
      kind: "negative" as const,
    }));

  const roots: TasteNode[] = [];
  const nested = [...themes, ...tones, ...moods].slice(0, 8);
  if (genres.length || nested.length) {
    const name = signatureLabel(genres, themes, tones, moods);
    const head = genres[0] ?? nested[0]!;
    roots.push({
      key: "signature",
      name,
      value: head.value,
      kind: "genre",
      children: nested.length ? nested : genres.slice(0, 6),
    });
  }
  const extra = [
    branch("genres", "Genres", "genre", genres),
    branch("themes", "Themes", "theme", themes),
    branch("tone", "Tone", "tone", tones),
    branch("mood", "Mood", "mood", moods),
    branch("people", "People", "person", people),
    branch("eras", "Eras", "era", eras),
    branch("craft", "Craft you keep", "craft", craft),
    branch("no", "Leave out", "negative", negative),
  ];
  for (const node of extra) if (node) roots.push(node);
  return roots;
}

export function profileSummary(taste: TasteProfile) {
  const graph = tasteGraph(taste);
  const sig = graph[0];
  if (!sig) return "Still learning how you watch. Mark films, import, or scan Gmail.";
  const kids = (sig.children ?? []).slice(0, 3).map((n) => n.name.toLowerCase());
  const extra = kids.length ? ` Drawn to ${kids.join(", ")}.` : "";
  return `${sig.name}.${extra}`;
}
