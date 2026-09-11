import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as MOVIE_BY_SLUG, n as MOVIES, r as MOVIE_BY_ID, s as parseImportText } from "./import-BleDzmfj.mjs";
import { t as authMiddleware } from "./middleware-C66df2GZ.mjs";
import { Qt as string, Wt as custom, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { i as useCurrentUserState, n as cn, t as BootScreen } from "./cn-DVA-FXpQ.mjs";
import { c as Compass, i as Search, l as Clapperboard, t as UserRound, u as Bookmark } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-DvR4XdT7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function movieFeatures(movie) {
	const f = {
		[`year:${Math.floor(movie.year / 10) * 10}`]: .4,
		[`cert:${movie.certification}`]: .2,
		[`audience:${movie.audience}`]: .5
	};
	f[`director:${movie.director.toLowerCase()}`] = 1;
	for (const g of movie.genres) f[`genre:${g.toLowerCase()}`] = .9;
	for (const t of movie.themes) f[`theme:${t.toLowerCase()}`] = .85;
	for (const t of movie.tones) f[`tone:${t.toLowerCase()}`] = .8;
	for (const m of movie.moods) f[`mood:${m.toLowerCase()}`] = .7;
	for (const w of movie.writers) f[`writer:${w.toLowerCase()}`] = .5;
	for (const c of movie.cast.slice(0, 3)) f[`actor:${c.name.toLowerCase()}`] = .45;
	return f;
}
function cosine(a, b) {
	let dot = 0;
	let na = 0;
	let nb = 0;
	for (const v of Object.values(a)) na += v * v;
	for (const v of Object.values(b)) nb += v * v;
	if (!na || !nb) return 0;
	for (const [k, v] of Object.entries(a)) if (b[k]) dot += v * b[k];
	return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
var WEIGHT = {
	love: 1,
	like: .7,
	seen: .55,
	import_seen: .6,
	save: .45,
	linger: .22,
	trailer_started: .12,
	details_opened: .08,
	search: .1,
	import_watchlist: .2,
	skip: -.25,
	not_interested: -.9,
	dislike: -.7
};
function emptyTaste() {
	return {
		version: "1.4.0",
		affinities: {}
	};
}
function rebuildTaste(events) {
	const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId));
	const aff = {};
	for (const event of events) {
		if (reversed.has(event.id) || event.action === "undo") continue;
		const w = WEIGHT[event.action];
		if (!w) continue;
		const movie = MOVIE_BY_ID[event.entityId];
		if (!movie) continue;
		const features = movieFeatures(movie);
		const strength = event.strength ?? 1;
		for (const [k, v] of Object.entries(features)) aff[k] = (aff[k] ?? 0) + w * v * strength;
	}
	return {
		version: "1.4.0",
		affinities: aff
	};
}
function topAffinities(taste, prefix, n = 6) {
	return Object.entries(taste.affinities).filter(([k, v]) => k.startsWith(prefix) && v > .15).sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, value]) => ({
		key,
		name: key.slice(prefix.length).replace(/\b\w/g, (c) => c.toUpperCase()),
		value
	}));
}
function projectMovieState(events) {
	const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId));
	const map = {};
	const seen = /* @__PURE__ */ new Set();
	for (const e of [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))) {
		if (seen.has(e.id) || reversed.has(e.id) || e.action === "undo") continue;
		seen.add(e.id);
		const s = map[e.entityId] ?? {
			movieId: e.entityId,
			seen: false,
			saved: false,
			notInterested: false,
			skipCount: 0,
			impressionCount: 0,
			neverShowAgain: false
		};
		switch (e.action) {
			case "impression":
				s.impressionCount += 1;
				s.lastImpressionAt = e.occurredAt;
				break;
			case "seen":
			case "love":
			case "like":
			case "neutral":
			case "dislike":
			case "import_seen":
				s.seen = true;
				s.neverShowAgain = true;
				if (e.action === "love" || e.action === "like" || e.action === "neutral" || e.action === "dislike") s.sentiment = e.action;
				break;
			case "save":
				s.saved = true;
				break;
			case "unsave":
				s.saved = false;
				break;
			case "skip":
				s.skipCount += 1;
				s.lastSkippedAt = e.occurredAt;
				break;
			case "not_interested":
				s.notInterested = true;
				s.neverShowAgain = true;
				s.saved = false;
		}
		map[e.entityId] = s;
	}
	return map;
}
function eligible(movie, state, now, exclude, session) {
	if (state?.notInterested || state?.neverShowAgain || state?.seen || state?.saved) return false;
	if (exclude?.has(movie.id)) return false;
	if (session?.englishOnly && movie.language !== "en") return false;
	if (state?.lastSkippedAt) {
		if ((now.getTime() - new Date(state.lastSkippedAt).getTime()) / 36e5 < 12) return false;
	}
	return true;
}
function sessionBump(movie, session) {
	let n = 0;
	if (session?.profileKind === "kids") {
		if (movie.audience === "adult" || movie.certification === "R") n -= .45;
		else n += .14;
	}
	if (session?.who === "Family") {
		if (movie.audience === "adult") n -= .22;
		else n += .1;
	} else if (session?.who === "Friends") n += movie.popularity * .08;
	const mood = session?.mood;
	if (mood === "Scary" && movie.genres.some((g) => /horror/i.test(g))) n += .16;
	if (mood === "Funny" && movie.genres.some((g) => /comedy/i.test(g))) n += .16;
	if (mood === "Intense" && movie.tones.some((t) => /tense|operatic|dread/i.test(t))) n += .14;
	if (mood === "Quiet" && movie.tones.some((t) => /tender|solemn|cerebral|quiet/i.test(t))) n += .14;
	if (mood === "Mind-bending" && movie.genres.some((g) => /science|mystery/i.test(g))) n += .16;
	return n;
}
function rank(opts) {
	const now = opts.now ?? /* @__PURE__ */ new Date();
	const taste = opts.taste.affinities;
	const hasTaste = Object.keys(taste).length > 2;
	const scored = [];
	for (const movie of MOVIES) {
		const state = opts.movieState[movie.id];
		if (!opts.catalog && !opts.includeIds?.has(movie.id) && !eligible(movie, state, now, opts.excludeIds, opts.session)) continue;
		const sim = hasTaste ? cosine(taste, movieFeatures(movie)) : movie.quality * .7 + movie.popularity * .2;
		let score = sim * .62 + movie.quality * .22 + movie.popularity * .08;
		if (opts.subscribed?.some((p) => movie.watch.some((w) => w.included && w.provider === p))) score += .04;
		const age = now.getFullYear() - movie.year;
		score += Math.max(0, .06 - age / 400);
		if (state?.skipCount) score -= Math.min(.2, state.skipCount * .05);
		if (state?.impressionCount && state.impressionCount >= 3 && !state.saved && !state.seen) score -= .08;
		score += sessionBump(movie, opts.session);
		const reasons = [{
			type: "taste",
			label: hasTaste ? "Matches how you watch" : "Craft first",
			contribution: sim
		}, {
			type: "quality",
			label: "High craft",
			contribution: movie.quality * .22
		}];
		const directorKey = `director:${movie.director.toLowerCase()}`;
		if (movie.director && (taste[directorKey] ?? 0) > .3) {
			reasons.push({
				type: "director",
				label: movie.director,
				contribution: .12
			});
			score += .06;
		}
		scored.push({
			movie,
			rank: 0,
			score,
			tasteRank: Math.round(Math.max(1, Math.min(99, score * 90 + 8))),
			matchLabel: hasTaste ? sim > .35 ? "For you" : sim > .18 ? "Adjacent" : "Wildcard" : "Craft",
			statement: hasTaste ? `${movie.director}. ${movie.themes.slice(0, 2).join(" · ")}.` : `${movie.year} · ${movie.genres[0]}`,
			reasons
		});
	}
	scored.sort((a, b) => b.score - a.score);
	return { recommendations: scored.slice(0, opts.limit ?? 24).map((r, i) => ({
		...r,
		rank: i + 1
	})) };
}
function sessionShownIds(events, sessionId) {
	const reversed = new Set(events.filter((e) => e.action === "undo" && e.reversesId).map((e) => e.reversesId));
	const ids = /* @__PURE__ */ new Set();
	for (const e of events) {
		if (reversed.has(e.id)) continue;
		if (e.sessionId !== sessionId) continue;
		if (e.action === "impression" || e.action === "skip" || e.action === "not_interested" || e.action === "linger") ids.add(e.entityId);
	}
	return ids;
}
function composeQueue(served, ranked, shown, keep) {
	const out = [];
	const ids = /* @__PURE__ */ new Set();
	for (const r of served) {
		if (ids.has(r.movie.id)) continue;
		out.push(r);
		ids.add(r.movie.id);
	}
	if (keep && !ids.has(keep)) {
		const k = ranked.find((r) => r.movie.id === keep);
		if (k) {
			out.push(k);
			ids.add(keep);
		}
	}
	for (const r of ranked) {
		if (ids.has(r.movie.id) || shown.has(r.movie.id)) continue;
		out.push(r);
		ids.add(r.movie.id);
	}
	return out;
}
var STREAMING_SERVICES = [
	"Netflix",
	"Max",
	"Hulu",
	"Disney+",
	"Prime Video",
	"Apple TV",
	"MUBI"
];
var DEFAULT_PROFILES = [
	{
		id: "you",
		name: "You",
		kind: "self"
	},
	{
		id: "partner",
		name: "Partner",
		kind: "partner"
	},
	{
		id: "kids",
		name: "Kids",
		kind: "kids"
	}
];
/** Mixed adult + kids watches so household isolation is visible immediately. */
var SAMPLE_LIBRARY = `Title,Date
Annihilation,1/1/24
Arrival,1/2/24
The Lighthouse,1/3/24
"Dune: Part Two",1/4/24
Blade Runner 2049,1/5/24
Ex Machina,1/6/24
Coraline,1/7/24
"Paddington 2",1/8/24
Spirited Away,1/9/24
The Iron Giant,1/10/24
`;
function eventId() {
	return `e_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
function sessionId() {
	return `s_${Date.now().toString(36)}`;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Payload = object({ payload: custom() });
var pullKinoState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({}).parse(input ?? {})).handler(createSsrRpc("dd61b80e7e8b6581fc8b8b1749bc3bf06cd64556a7f7dead94015fd3542e7d47"));
var pushKinoState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => Payload.parse(input)).handler(createSsrRpc("ebc8f5eae66de4bb06ac5b7dbdebb422b6be92d68616939a83fd079b9e3845af"));
var Input = object({
	text: string().max(4e5).optional(),
	username: string().max(80).optional()
});
/** Public Letterboxd RSS + pasted lists — no account required. */
var importLibrary = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(createSsrRpc("718e7176558e73f738648fc8c56ca22fbe586506ac610f9f9f4f43574a26ae28"));
var pullMailLibrary = createServerFn({ method: "POST" }).validator((input) => object({}).parse(input ?? {})).handler(createSsrRpc("0db941931ccf4e2d979316ead45c780ed465dc80e2c2766feb3bb57fcb0241cd"));
var LAST_USER$1 = "kino.lastUserId";
function key(userId) {
	return `kino.v2.${userId}`;
}
function withTimeout(p, ms) {
	return new Promise((resolve, reject) => {
		const t = setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), ms);
		p.then((v) => {
			clearTimeout(t);
			resolve(v);
		}, (e) => {
			clearTimeout(t);
			reject(e);
		});
	});
}
function eventsFor(state) {
	const pid = state.activeProfileId;
	return state.events.filter((e) => e.profileId === pid || e.profileId === "everyone");
}
function persist(state) {
	const data = {
		events: state.events,
		services: state.services,
		profiles: state.profiles,
		activeProfileId: state.activeProfileId,
		pendingAsks: state.pendingAsks,
		englishOnly: state.englishOnly
	};
	try {
		localStorage.setItem(key(state.userId), JSON.stringify(data));
		if (state.signedIn && state.userId !== "guest") localStorage.setItem(LAST_USER$1, state.userId);
	} catch {}
	if (state.signedIn) pushKinoState({ data: { payload: data } }).catch(() => void 0);
}
function loadLocal(userId) {
	try {
		const raw = localStorage.getItem(key(userId));
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
async function pullRemote(userId) {
	try {
		const p = (await withTimeout(pullKinoState({ data: {} }), 4e3)).payload;
		if (!p) return;
		const state = useKino.getState();
		if (state.userId !== userId) return;
		const map = /* @__PURE__ */ new Map();
		for (const e of [...state.events, ...p.events ?? []]) map.set(e.id, e);
		const events = [...map.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
		useKino.setState({
			events,
			services: p.services?.length ? p.services : state.services,
			profiles: p.profiles?.length ? p.profiles : state.profiles,
			pendingAsks: p.pendingAsks?.length ? p.pendingAsks : state.pendingAsks,
			activeProfileId: p.activeProfileId || state.activeProfileId,
			englishOnly: typeof p.englishOnly === "boolean" ? p.englishOnly : state.englishOnly
		});
		useKino.getState().rebuildQueue(useKino.getState().queue[useKino.getState().index]?.movie.id);
	} catch {}
}
function assemble(state, keep) {
	const scoped = eventsFor(state);
	const movieState = projectMovieState(scoped);
	const taste = rebuildTaste(scoped);
	const hidden = (id) => Boolean(movieState[id]?.notInterested);
	const languageOk = (id) => !state.englishOnly || MOVIE_BY_ID[id]?.language === "en";
	const requested = keep === null ? void 0 : keep ?? state.queue[state.index]?.movie.id;
	const keepId = requested && !hidden(requested) && languageOk(requested) ? requested : void 0;
	const shown = sessionShownIds(scoped, state.sessionKey);
	const kind = state.profiles.find((p) => p.id === state.activeProfileId)?.kind;
	const rankingInput = {
		taste,
		movieState,
		events: scoped,
		now: /* @__PURE__ */ new Date(),
		subscribed: state.services,
		session: {
			who: state.tonight?.who,
			mood: state.tonight?.mood,
			profileKind: kind,
			englishOnly: state.englishOnly
		}
	};
	const ranksList = rank({
		...rankingInput,
		limit: MOVIES.length,
		catalog: true
	}).recommendations;
	const ranks = {};
	for (const r of ranksList) ranks[r.movie.id] = r;
	const ranked = rank({
		...rankingInput,
		limit: 36,
		excludeIds: shown,
		includeIds: keepId ? /* @__PURE__ */ new Set([keepId]) : void 0
	}).recommendations;
	const queue = composeQueue((keepId ? state.queue.slice(0, state.index + 1) : []).filter((r) => (r.movie.id === keepId || !hidden(r.movie.id)) && languageOk(r.movie.id)), ranked, shown, keepId);
	let index = 0;
	if (keepId) {
		const found = queue.findIndex((r) => r.movie.id === keepId);
		index = found >= 0 ? found : 0;
	}
	return {
		movieState,
		taste,
		ranks,
		queue,
		index
	};
}
function listSaved(movieState) {
	return Object.values(movieState).filter((s) => s.saved && !s.notInterested).map((s) => MOVIE_BY_ID[s.movieId]).filter((m) => Boolean(m));
}
var useKino = create((set, get) => ({
	ready: false,
	userId: "guest",
	signedIn: false,
	events: [],
	movieState: {},
	taste: emptyTaste(),
	services: [],
	profiles: DEFAULT_PROFILES,
	activeProfileId: "you",
	pendingAsks: [],
	englishOnly: false,
	tonight: null,
	queue: [],
	ranks: {},
	index: 0,
	sessionKey: sessionId(),
	undo: null,
	trailerFor: null,
	scanning: false,
	importing: false,
	hydrate: async ({ userId, signedIn }) => {
		const state = get();
		if (state.ready && state.userId === userId) {
			if (signedIn && !state.signedIn) {
				set({ signedIn: true });
				await pullRemote(userId);
				persist(get());
			}
			return;
		}
		const carry = state.ready && state.userId === "guest" && userId !== "guest" ? state.events : [];
		const local = loadLocal(userId);
		let events = local?.events ?? [];
		if (carry.length) {
			const map = /* @__PURE__ */ new Map();
			for (const e of [...events, ...carry.map((e) => ({
				...e,
				userId
			}))]) map.set(e.id, e);
			events = [...map.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
		}
		const services = local?.services ?? [];
		const profiles = local?.profiles ?? DEFAULT_PROFILES;
		const activeProfileId = local?.activeProfileId ?? "you";
		const pendingAsks = local?.pendingAsks ?? [];
		const englishOnly = local?.englishOnly ?? false;
		set({
			ready: true,
			userId,
			signedIn,
			events,
			services,
			profiles,
			activeProfileId,
			pendingAsks,
			englishOnly,
			sessionKey: get().sessionKey
		});
		get().rebuildQueue(null);
		if (!signedIn) return;
		await pullRemote(userId);
		persist(get());
	},
	rebuildQueue: (keep) => {
		try {
			set(assemble(get(), keep));
		} catch {}
	},
	record: (action, movieId, extra) => {
		const current = get();
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const event = {
			id: eventId(),
			userId: current.userId,
			profileId: extra?.profileId ?? current.activeProfileId,
			entityType: "movie",
			entityId: movieId,
			action,
			source: extra?.source ?? "feed",
			sessionId: current.sessionKey,
			occurredAt: now,
			reversesId: extra?.reversesId,
			strength: extra?.strength
		};
		set({
			events: [...current.events.filter((e) => e.id !== event.id), event],
			undo: [
				"skip",
				"save",
				"unsave",
				"not_interested",
				"seen",
				"love"
			].includes(action) ? {
				eventId: event.id,
				label: extra?.label ?? (action === "not_interested" ? "Not interested" : action)
			} : action === "undo" ? null : current.undo
		});
		persist(get());
		if (action === "skip" || action === "not_interested") {
			const cur = get().index;
			const nextId = get().queue.slice(cur + 1).find((r) => r.movie.id !== movieId)?.movie.id ?? null;
			get().rebuildQueue(nextId);
			const idx = nextId ? get().queue.findIndex((r) => r.movie.id === nextId) : 0;
			set({ index: Math.max(0, idx) });
		} else if (action !== "impression") get().rebuildQueue(get().queue[get().index]?.movie.id);
		else {
			const next = assemble(get(), get().queue[get().index]?.movie.id);
			set({
				movieState: next.movieState,
				taste: next.taste,
				ranks: next.ranks
			});
		}
	},
	undoLast: () => {
		const undo = get().undo;
		if (!undo) return;
		const original = get().events.find((e) => e.id === undo.eventId);
		set({ undo: null });
		if (!original) return;
		get().record("undo", original.entityId, {
			source: "undo",
			reversesId: original.id,
			profileId: original.profileId
		});
	},
	setIndex: (i) => {
		set({ index: i });
		const rec = get().queue[i];
		if (!rec) return;
		const st = get().movieState[rec.movie.id];
		if (!st?.lastImpressionAt || Date.now() - new Date(st.lastImpressionAt).getTime() > 216e5) get().record("impression", rec.movie.id, { source: "feed" });
	},
	setServices: (services) => {
		set({ services });
		persist(get());
		get().rebuildQueue(get().queue[get().index]?.movie.id);
	},
	setEnglishOnly: (englishOnly) => {
		set({ englishOnly });
		persist(get());
		get().rebuildQueue(null);
	},
	setActiveProfile: (id) => {
		set({
			activeProfileId: id,
			index: 0
		});
		persist(get());
		get().rebuildQueue(null);
	},
	renameProfile: (id, name) => {
		set({ profiles: get().profiles.map((p) => p.id === id ? {
			...p,
			name
		} : p) });
		persist(get());
	},
	setTonight: (tonight) => {
		set({
			tonight,
			index: 0
		});
		get().rebuildQueue(null);
	},
	answerAsk: (movieId, profileId) => {
		set({ pendingAsks: get().pendingAsks.filter((a) => a.movieId !== movieId) });
		if (profileId !== "skip") {
			const existing = get().events.find((e) => e.entityId === movieId && (e.action === "import_seen" || e.action === "import_watchlist"));
			if (existing) set({ events: get().events.map((e) => e.id === existing.id ? {
				...e,
				profileId
			} : e) });
			else get().record("import_seen", movieId, {
				source: "household",
				profileId
			});
		}
		persist(get());
		get().rebuildQueue(get().queue[get().index]?.movie.id);
	},
	ingestHits: (hits, askHousehold) => {
		if (!hits.length) return 0;
		const state = get();
		const existing = new Set(state.events.filter((e) => e.action === "import_seen" || e.action === "seen").map((e) => e.entityId));
		const extra = [];
		const asks = [...state.pendingAsks];
		const now = (/* @__PURE__ */ new Date()).toISOString();
		for (const hit of hits) {
			if (existing.has(hit.movieId)) continue;
			existing.add(hit.movieId);
			const movie = MOVIE_BY_ID[hit.movieId];
			const familyTitle = Boolean(movie && movie.audience !== "adult");
			extra.push({
				id: eventId(),
				userId: state.userId,
				profileId: askHousehold && familyTitle ? "pending" : state.activeProfileId,
				entityType: "movie",
				entityId: hit.movieId,
				action: hit.action,
				source: hit.source,
				sessionId: state.sessionKey,
				occurredAt: now,
				strength: hit.rating ? Math.min(1.2, hit.rating / 5) : void 0
			});
			if (askHousehold && movie && movie.audience !== "adult" && !asks.some((a) => a.movieId === movie.id)) asks.push({
				movieId: movie.id,
				title: movie.title,
				source: hit.source
			});
		}
		if (!extra.length) return 0;
		set({
			events: [...state.events, ...extra],
			pendingAsks: asks
		});
		persist(get());
		get().rebuildQueue(get().queue[get().index]?.movie.id);
		return extra.length;
	},
	importText: async (input) => {
		if (get().importing) return {
			ok: false,
			count: 0,
			error: "Already importing."
		};
		set({ importing: true });
		try {
			const hits = [];
			if (input.text?.trim()) hits.push(...parseImportText(input.text));
			if (input.username?.trim()) try {
				const res = await importLibrary({ data: { username: input.username } });
				hits.push(...res.hits);
			} catch {}
			const uniq = /* @__PURE__ */ new Map();
			for (const h of hits) uniq.set(h.movieId, h);
			const n = get().ingestHits([...uniq.values()], true);
			set({ importing: false });
			if (!n) return {
				ok: false,
				count: 0,
				error: "No catalog titles in that list yet."
			};
			return {
				ok: true,
				count: n
			};
		} catch {
			set({ importing: false });
			return {
				ok: false,
				count: 0,
				error: "Could not import right now."
			};
		}
	},
	scanMail: async () => {
		if (get().scanning) return {
			ok: false,
			count: 0,
			error: "Already reading mail."
		};
		set({ scanning: true });
		try {
			const lib = await withTimeout(pullMailLibrary({ data: {} }), 18e3);
			set({ scanning: false });
			if (lib.loginRequired && !lib.hits.length) return {
				ok: false,
				count: 0,
				loginRequired: true,
				loginUrl: lib.loginUrl,
				error: lib.error
			};
			const n = get().ingestHits(lib.hits, true);
			return {
				ok: true,
				count: n,
				error: n ? void 0 : lib.error
			};
		} catch (e) {
			set({ scanning: false });
			if ((e instanceof Error ? e.message : "") === "Unauthorized") return {
				ok: false,
				count: 0,
				loginRequired: true
			};
			return {
				ok: false,
				count: 0,
				error: "Could not reach Gmail just now."
			};
		}
	},
	openTrailer: (id) => {
		set({ trailerFor: id });
		if (id) get().record("trailer_started", id, { source: "viewport" });
	}
}));
var PLACES = [
	{
		to: "/",
		label: "For you",
		icon: Clapperboard
	},
	{
		to: "/tonight",
		label: "Tonight",
		icon: Compass
	},
	{
		to: "/saved",
		label: "Saved",
		icon: Bookmark
	},
	{
		to: "/search",
		label: "Search",
		icon: Search
	},
	{
		to: "/profile",
		label: "Taste",
		icon: UserRound
	}
];
function TabBar() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "tab-bar",
		"aria-label": "Places",
		children: PLACES.map((p) => {
			const on = p.to === "/" ? pathname === "/" : pathname.startsWith(p.to);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: p.to,
				className: cn("press flex min-h-11 flex-col items-center justify-center gap-0.5", on ? "text-fg" : "text-marker"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(p.icon, {
					className: "size-5",
					strokeWidth: on ? 2 : 1.6
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "type-caption",
					children: p.label
				})]
			}, p.to);
		})
	});
}
function UndoToast() {
	const undo = useKino((s) => s.undo);
	const undoLast = useKino((s) => s.undoLast);
	(0, import_react.useEffect)(() => {
		if (!undo) return;
		const id = undo.eventId;
		const t = window.setTimeout(() => {
			if (useKino.getState().undo?.eventId === id) useKino.setState({ undo: null });
		}, 4200);
		return () => window.clearTimeout(t);
	}, [undo]);
	if (!undo) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "undo-host",
		role: "status",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "undo-toast",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "type-content text-body",
				children: undo.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-auto min-h-11 type-chrome",
				onClick: undoLast,
				children: "Undo"
			})]
		})
	});
}
function TrailerOverlay() {
	const id = useKino((s) => s.trailerFor);
	const open = useKino((s) => s.openTrailer);
	if (!id) return null;
	const movie = MOVIE_BY_ID[id];
	if (!movie?.trailerYoutubeId) return null;
	const yt = movie.trailerYoutubeId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-40 bg-bg",
		role: "dialog",
		"aria-label": `Trailer · ${movie.title}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: `${movie.title} trailer`,
				className: "h-full w-full border-0",
				src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
				allow: "autoplay; encrypted-media; fullscreen",
				allowFullScreen: true,
				referrerPolicy: "strict-origin-when-cross-origin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "press absolute left-4 top-4 z-10 h-11 rounded-full px-4 well type-chrome",
				style: { marginTop: "var(--safe-top)" },
				onClick: () => open(null),
				children: "Close"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: `https://www.youtube.com/watch?v=${yt}`,
				target: "_blank",
				rel: "noopener noreferrer",
				className: "press absolute right-4 top-4 z-10 flex h-11 items-center rounded-full px-4 well type-chrome",
				style: { marginTop: "var(--safe-top)" },
				children: "YouTube"
			})
		]
	});
}
function NativeSheet({ open, onClose, label, children }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet-scrim",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": label,
			className: "sheet-card",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sheet-grabber",
				"aria-hidden": "true"
			}), children]
		})
	});
}
var MOVIE_ART = {
	"annihilation": {
		poster: "4YRplSk6BhH6PRuE9gfyw9byUJ6.jpg",
		backdrop: "9trZvBr44UGedUOiGo3jgSUw13e.jpg"
	},
	"arrival": {
		poster: "pEzNVQfdzYDzVK0XqxERIw2x2se.jpg",
		backdrop: "8MUZz7oPXQftFTslZpRP3CVMOoq.jpg"
	},
	"dune-part-two": {
		poster: "6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
		backdrop: "eZ239CUp1d6OryZEBPnO2n87gMG.jpg"
	},
	"blade-runner-2049": {
		poster: "gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
		backdrop: "gNdLJU9TxrpGx4dkZidjys3fyy0.jpg"
	},
	"ex-machina": {
		poster: "dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg",
		backdrop: "uqOuJ50EtTj7kkDIXP8LCg7G45D.jpg"
	},
	"prometheus": {
		poster: "qsYQflQhOuhDpQ0W2aOcwqgDAeI.jpg",
		backdrop: "qDG5SlGkWNsjSJWiGTBMFI8DpzA.jpg"
	},
	"alien": {
		poster: "vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
		backdrop: "AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg"
	},
	"sunshine": {
		poster: "oKGGeJ8qvm0UmClz43VJ31fzPP7.jpg",
		backdrop: "5AIAnucJKZ3sHpm7r1ykFVIoUHK.jpg"
	},
	"the-lighthouse": {
		poster: "yAKNmpcUweGH6WMCEWenwU9PsbE.jpg",
		backdrop: "sYLzRuEcwSz0L1Z92wQNrETHU9O.jpg"
	},
	"the-witch": {
		poster: "zap5hpFCWSvdWSuPGAQyjUv2wAC.jpg",
		backdrop: "zi2oYYNSSv7t44iSt5YrxHX9PYs.jpg"
	},
	"parasite": {
		poster: "7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
		backdrop: "hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg"
	},
	"there-will-be-blood": {
		poster: "fa0RDkAlCec0STeMNAhPaF89q6U.jpg",
		backdrop: "9UAKA6ceZi6TgQwTAAMt7DWwYPI.jpg"
	},
	"no-country-for-old-men": {
		poster: "6d5XOczc226jECq0LIX0siKtgHR.jpg",
		backdrop: "gddUsvfyySrM5k8B8wwJy2VRlBx.jpg"
	},
	"heat": {
		poster: "umSVjVdbVwtx5ryCA2QXL44Durm.jpg",
		backdrop: "xKsnZDERG1dk95wuZ5q9iks3OL3.jpg"
	},
	"drive": {
		poster: "602vevIURmpDfzbnv5Ubi6wIkQm.jpg",
		backdrop: "hoyAALgfmjMEK7O1wZ4r8wT91RP.jpg"
	},
	"mad-max-fury-road": {
		poster: "ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg",
		backdrop: "uT895WNwm0aIJRtGizcQhrejWUo.jpg"
	},
	"get-out": {
		poster: "tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
		backdrop: "bBQHALHRAaaORlPNXv7fNcRXYdx.jpg"
	},
	"her": {
		poster: "eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
		backdrop: "1YnZchmaGc8dchgRPDpR1KGrixA.jpg"
	},
	"whiplash": {
		poster: "7fn624j5lj3xTme2SgiLCeuedmO.jpg",
		backdrop: "fRGxZuo7jJUWQsVg9PREb98Aclp.jpg"
	},
	"interstellar": {
		poster: "yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
		backdrop: "5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg"
	},
	"the-matrix": {
		poster: "aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg",
		backdrop: "lrtSb1skJayPydZk0OSMAKjBOVe.jpg"
	},
	"oppenheimer": {
		poster: "8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
		backdrop: "neeNHeXjMF5fXoCJRsOmkNGC7q.jpg"
	},
	"everything-everywhere": {
		poster: "u68AjlvlutfEIcpmbYpKcdi09ut.jpg",
		backdrop: "ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg"
	},
	"spirited-away": {
		poster: "39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
		backdrop: "dyJvKsNs2KP8qQnAXbRwDjblViy.jpg"
	},
	"coraline": {
		poster: "4jeFXQYytChdZYE9JYO7Un87IlW.jpg",
		backdrop: "hofnlIyF6bePkgQOpcuRWLvzf15.jpg"
	},
	"portrait-of-a-lady-on-fire": {
		poster: "rUDuOKpkKBHxx41BScqKej72iT3.jpg",
		backdrop: "ivJ5UzT6IzucLVfbZwCCwiJJoBz.jpg"
	},
	"moonlight": {
		poster: "qLnfEmPrDjJfPyyddLJPkXmshkp.jpg",
		backdrop: "jm1oD3eB08LImSwL1LrzF9AJQ5b.jpg"
	},
	"uncut-gems": {
		poster: "6XN1vxHc7kUSqNWtaQKN45J5x2v.jpg",
		backdrop: "eGljNfNCrPhFYG2RXXmmE0OKu5.jpg"
	},
	"seven-samurai": {
		poster: "lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg",
		backdrop: "qvZ91FwMq6O47VViAr8vZNQz3WI.jpg"
	},
	"oldboy": {
		poster: "pWDtjs568ZfOTMbURQBYuT4Qxka.jpg",
		backdrop: "sdwjQEM869JFwMytTmvr6ggvaUl.jpg"
	},
	"the-iron-giant": {
		poster: "k1Cv5CHJvqGWK1xJDUJz8DojFEy.jpg",
		backdrop: "ni5cXCrrGzoiIEoIwOzGiIwMZlH.jpg"
	},
	"howls-moving-castle": {
		poster: "13kOl2v0nD2OLbVSHnHk8GUFEhO.jpg",
		backdrop: "nv5wwZou159v5OC61i4ElR7OqyY.jpg"
	},
	"paddington-2": {
		poster: "1OJ9vkD5xPt3skC6KguyXAgagRZ.jpg",
		backdrop: "kRVUMsXFzhuXjr20JcCGc6TapxA.jpg"
	},
	"the-incredibles": {
		poster: "2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg",
		backdrop: "lxwzY9vNwjDgxWKt3zZ6zcU6rEJ.jpg"
	}
};
var CDN = "https://image.tmdb.org/t/p";
function artUrl(id, kind, size) {
	const file = MOVIE_ART[id]?.[kind];
	if (!file) return void 0;
	return `${CDN}/${size}/${file}`;
}
function stillUrl(youtubeId, size) {
	if (!youtubeId) return void 0;
	return size === "max" ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg` : `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}
function listed(...urls) {
	return urls.filter((u) => Boolean(u));
}
function sourcesFor(slug, kind) {
	const movie = MOVIE_BY_SLUG[slug];
	const id = movie?.id ?? slug;
	const ytMax = stillUrl(movie?.trailerYoutubeId, "max");
	const ytHq = stillUrl(movie?.trailerYoutubeId, "hq");
	const poster = listed(artUrl(id, "poster", "w780"), artUrl(id, "poster", "w500"), ytMax, ytHq);
	const wide = listed(artUrl(id, "backdrop", "w1280"), artUrl(id, "backdrop", "w780"), artUrl(id, "poster", "w780"), ytMax, ytHq);
	if (kind === "hero") return {
		poster,
		wide
	};
	if (kind === "cover") return {
		poster: wide,
		wide
	};
	return {
		poster,
		wide: poster
	};
}
function ArtImg({ urls, priority, hidden }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	const src = urls[index];
	if (!src) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		hidden,
		draggable: false,
		fetchPriority: priority ? "high" : "low",
		decoding: "async",
		className: "pointer-events-none absolute inset-0 h-full w-full object-cover",
		onError: () => setIndex((n) => n + 1)
	});
}
function useCoverShape(ref) {
	const [shape, setShape] = (0, import_react.useState)(() => typeof window !== "undefined" && window.matchMedia("(min-width: 720px)").matches ? "wide" : "tall");
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		let current = shape;
		let primed = false;
		let raf = 0;
		const commit = (next) => {
			if (next === current) return;
			current = next;
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => setShape(next));
		};
		const ro = new ResizeObserver((entries) => {
			const box = entries[0]?.contentRect;
			if (!box || box.width < 2 || box.height < 2) return;
			const ar = box.width / box.height;
			if (!primed) {
				primed = true;
				commit(ar >= 1 ? "wide" : "tall");
				return;
			}
			if (current === "tall" && ar >= 1.2) commit("wide");
			else if (current === "wide" && ar <= .85) commit("tall");
		});
		ro.observe(el);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);
	return shape;
}
function CoverSlot({ children }) {
	const ref = (0, import_react.useRef)(null);
	const shape = useCoverShape(ref);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "cover-slot",
		"data-cover": shape,
		children: children(shape)
	});
}
function StillImage({ slug, atmosphere, title, className, alt, kind = "poster", shape = "tall", priority = false }) {
	const { poster, wide } = sourcesFor(slug, kind);
	const hasArt = Boolean(poster[0] || wide[0]);
	const [seen, setSeen] = (0, import_react.useState)({
		tall: shape === "tall" || kind !== "hero",
		wide: shape === "wide" || kind === "cover"
	});
	(0, import_react.useEffect)(() => {
		if (kind !== "hero") return;
		setSeen((s) => s[shape] ? s : {
			...s,
			[shape]: true
		});
	}, [kind, shape]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "img",
		"aria-label": alt ?? title ?? slug,
		className: cn("atm overflow-hidden", hasArt && "atm-photo", `atm-${atmosphere}`, className),
		children: [kind === "hero" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [seen.tall ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtImg, {
			urls: poster,
			hidden: shape !== "tall",
			priority: priority && shape === "tall"
		}) : null, seen.wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtImg, {
			urls: wide,
			hidden: shape !== "wide",
			priority: priority && shape === "wide"
		}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtImg, {
			urls: kind === "cover" ? wide : poster,
			priority
		}), title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }) : null]
	});
}
function HouseholdAsk() {
	const ask = useKino((s) => s.pendingAsks[0]);
	const profiles = useKino((s) => s.profiles);
	const answer = useKino((s) => s.answerAsk);
	if (!ask) return null;
	const movie = MOVIE_BY_ID[ask.movieId];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSheet, {
		open: true,
		onClose: () => answer(ask.movieId, "skip"),
		label: `Who watched ${ask.title}?`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "type-caption uppercase tracking-wide text-marker",
				children: "Household"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mt-1 type-section",
				children: [
					"Who watched ",
					ask.title,
					"?"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 type-content text-body",
				children: "Shared receipts mix kids’ films with your taste. Tell KINO who this belongs to. Skip if you’re not sure."
			}),
			movie ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StillImage, {
				slug: movie.slug,
				atmosphere: movie.atmosphere,
				title: movie.title,
				className: "mt-4 aspect-poster w-24 rounded-lg"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-2",
				children: [
					profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "press well flex h-12 w-full items-center px-4 type-content",
						onClick: () => answer(ask.movieId, p.id),
						children: p.name
					}, p.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "press well flex h-12 w-full items-center px-4 type-content",
						onClick: () => answer(ask.movieId, "everyone"),
						children: "Everyone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex h-11 w-full items-center justify-center type-chrome text-body",
						onClick: () => answer(ask.movieId, "skip"),
						children: "Not sure"
					})
				]
			})
		]
	});
}
var LAST_USER = "kino.lastUserId";
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const hydrate = useKino((s) => s.hydrate);
	const ready = useKino((s) => s.ready);
	(0, import_react.useEffect)(() => {
		if (useKino.getState().ready) return;
		let userId = "guest";
		try {
			const last = localStorage.getItem(LAST_USER);
			if (last) userId = last;
		} catch {}
		hydrate({
			userId,
			signedIn: false
		});
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		hydrate({
			userId: user.id,
			signedIn: true
		});
	}, [
		hydrate,
		isPending,
		user
	]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-0 flex-1 overflow-hidden",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UndoToast, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrailerOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdAsk, {})
		]
	});
}
//#endregion
export { STREAMING_SERVICES as a, listSaved as c, useKino as d, SAMPLE_LIBRARY as i, stillUrl as l, CoverSlot as n, StillImage as o, NativeSheet as r, artUrl as s, AppShell as t, topAffinities as u };
