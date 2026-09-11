import { r as createServerFn } from "./ssr.mjs";
import { c as parseLetterboxdRss, o as letterboxdUsername, s as parseImportText, u as parsePastedTitles } from "./import-BleDzmfj.mjs";
import { Qt as string, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-BS-fUEjY.js
var Input = object({
	text: string().max(4e5).optional(),
	username: string().max(80).optional()
});
async function fetchRss(user, path) {
	try {
		const res = await fetch(`https://letterboxd.com/${encodeURIComponent(user)}/${path}`, {
			headers: {
				accept: "application/rss+xml, application/xml",
				"user-agent": "KINO/1.0"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return null;
		return (await res.text()).slice(0, 2e5);
	} catch {
		return null;
	}
}
/** Public Letterboxd RSS + pasted lists — no account required. */
var importLibrary_createServerFn_handler = createServerRpc({
	id: "718e7176558e73f738648fc8c56ca22fbe586506ac610f9f9f4f43574a26ae28",
	name: "importLibrary",
	filename: "src/lib/server/import.ts"
}, (opts) => importLibrary.__executeServer(opts));
var importLibrary = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(importLibrary_createServerFn_handler, async ({ data }) => {
	const hits = [];
	const sources = [];
	if (data.text?.trim()) {
		const found = parseImportText(data.text);
		hits.push(...found);
		for (const h of found) if (!sources.includes(h.source)) sources.push(h.source);
	}
	const user = letterboxdUsername(data.username ?? "");
	if (user) {
		const feeds = await Promise.all([fetchRss(user, "rss/"), fetchRss(user, "watchlist/rss/")]);
		for (const diary of feeds) {
			if (!diary) continue;
			const titles = parseLetterboxdRss(diary);
			const found = parsePastedTitles(titles.join("\n")).map((h) => ({
				...h,
				source: "letterboxd"
			}));
			hits.push(...found);
			if (found.length && !sources.includes("letterboxd")) sources.push("letterboxd");
		}
	}
	const uniq = /* @__PURE__ */ new Map();
	for (const h of hits) uniq.set(h.movieId, h);
	return {
		hits: [...uniq.values()],
		sources
	};
});
//#endregion
export { importLibrary_createServerFn_handler };
