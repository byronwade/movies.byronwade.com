import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  letterboxdUsername,
  parseImportText,
  parseLetterboxdRss,
  parsePastedTitles,
  type ImportHit,
} from "@/tasterank";
import { APP_UA } from "@/lib/brand";

const Input = z.object({
  text: z.string().max(400_000).optional(),
  username: z.string().max(80).optional(),
});

async function fetchRss(user: string, path: string) {
  try {
    const res = await fetch(`https://letterboxd.com/${encodeURIComponent(user)}/${path}`, {
      headers: { accept: "application/rss+xml, application/xml", "user-agent": APP_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 200_000);
  } catch {
    return null;
  }
}

/** Public Letterboxd RSS + pasted lists — no account required. */
export const importLibrary = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<{ hits: ImportHit[]; sources: string[] }> => {
    const hits: ImportHit[] = [];
    const sources: string[] = [];
    if (data.text?.trim()) {
      const found = parseImportText(data.text);
      hits.push(...found);
      for (const h of found) if (!sources.includes(h.source)) sources.push(h.source);
    }
    const user = letterboxdUsername(data.username ?? "");
    if (user) {
      const feeds = await Promise.all([
        fetchRss(user, "rss/"),
        fetchRss(user, "watchlist/rss/"),
        fetchRss(user, "likes/rss/"),
      ]);
      for (const diary of feeds) {
        if (!diary) continue;
        const titles = parseLetterboxdRss(diary);
        const found = parsePastedTitles(titles.join("\n")).map((h) => ({ ...h, source: "letterboxd" as const }));
        hits.push(...found);
        if (found.length && !sources.includes("letterboxd")) sources.push("letterboxd");
      }
    }
    const uniq = new Map<string, ImportHit>();
    for (const h of hits) uniq.set(h.movieId, h);
    return { hits: [...uniq.values()], sources };
  });
