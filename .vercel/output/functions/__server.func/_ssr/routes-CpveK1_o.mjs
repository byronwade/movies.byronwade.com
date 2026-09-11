import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as LANGUAGE_LABEL } from "./import-BleDzmfj.mjs";
import { n as cn } from "./cn-DVA-FXpQ.mjs";
import { a as Play } from "../_libs/lucide-react.mjs";
import { d as useKino, l as stillUrl, n as CoverSlot, o as StillImage, r as NativeSheet, s as artUrl, t as AppShell } from "./shell-DvR4XdT7.mjs";
import { t as Button } from "./button-ChN6QJ9Z.mjs";
import { t as MovieActions } from "./actions-C3WvTIcz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CpveK1_o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function KeyArt({ movie, dim }) {
	const src = artUrl(movie.id, "backdrop", "w780") ?? stillUrl(movie.trailerYoutubeId, "hq") ?? stillUrl(movie.trailerYoutubeId, "max");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("pointer-events-none absolute inset-0 overflow-hidden", dim && "opacity-40"),
		"aria-hidden": true,
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "",
			className: "h-full w-full scale-125 object-cover blur-2xl"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-full w-full scale-110 atm", `atm-${movie.atmosphere}`) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "key-veil" })]
	});
}
function MovieViewport({ rec, active }) {
	const movie = rec.movie;
	const record = useKino((s) => s.record);
	const openTrailer = useKino((s) => s.openTrailer);
	const trailerFor = useKino((s) => s.trailerFor);
	const playing = active && trailerFor === movie.id;
	const [more, setMore] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		const t = window.setTimeout(() => {
			const s = useKino.getState().movieState[movie.id];
			if (s?.seen || s?.notInterested || s?.saved) return;
			useKino.getState().record("linger", movie.id, { source: "viewport" });
		}, 8e3);
		return () => window.clearTimeout(t);
	}, [active, movie.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative h-full w-full overflow-hidden",
		"aria-label": movie.title,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyArt, {
				movie,
				dim: playing
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col px-5",
				style: {
					paddingTop: "var(--safe-top)",
					paddingBottom: "calc(var(--tab-bar-h) + 0.85rem)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "cover-title press shrink-0 pt-3 text-center",
						onClick: () => {
							setMore(true);
							record("details_opened", movie.id);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "line-clamp-2 text-balance type-page",
							children: movie.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "cover-meta mt-1",
							children: [
								movie.year,
								" · ",
								movie.certification,
								" · ",
								movie.runtimeMin,
								"m"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverSlot, { children: (shape) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "cover-still",
						onClick: () => movie.trailerYoutubeId ? openTrailer(movie.id) : setMore(true),
						"aria-label": movie.trailerYoutubeId ? "Watch trailer" : "About",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StillImage, {
							slug: movie.slug,
							atmosphere: movie.atmosphere,
							kind: "hero",
							shape,
							priority: active,
							className: "photo-rim absolute inset-0 h-full w-full rounded-2xl"
						}), movie.trailerYoutubeId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pointer-events-none absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-fg text-ink-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-5 fill-current" })
						}) : null]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieActions, {
						movie,
						className: "shrink-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "cover-read press mt-2 shrink-0 text-left",
						onClick: () => setMore(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono type-chrome text-accent",
							children: [
								rec.tasteRank,
								" · ",
								rec.matchLabel
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 type-content text-fg",
							children: rec.statement
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSheet, {
				open: more,
				onClose: () => setMore(false),
				label: "About this film",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "type-chrome text-marker",
						children: "About this film"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 type-section",
						children: movie.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 type-content leading-relaxed text-pretty",
						children: movie.overview
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 type-caption text-body",
						children: [
							movie.director,
							" · ",
							movie.genres.join(" · "),
							movie.language !== "en" ? ` · ${LANGUAGE_LABEL[movie.language] ?? movie.language}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 type-caption text-marker",
						children: movie.themes.slice(0, 4).join(" · ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "press mt-5 flex h-11 w-full items-center justify-center type-content text-danger",
						onClick: () => {
							record("not_interested", movie.id, { label: "Not interested" });
							setMore(false);
						},
						children: "Not interested"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 type-caption text-marker",
						children: "Don’t show this film again. Skip only snoozes it."
					})
				]
			})
		]
	});
}
function DiscoveryFeed() {
	const queue = useKino((s) => s.queue);
	const index = useKino((s) => s.index);
	const setIndex = useKino((s) => s.setIndex);
	const trailerFor = useKino((s) => s.trailerFor);
	const scroller = (0, import_react.useRef)(null);
	(0, import_react.useCallback)((next) => {
		const root = scroller.current;
		if (!root) return;
		const clamped = Math.max(0, Math.min(next, queue.length - 1));
		setIndex(clamped);
		root.scrollTo({
			top: clamped * root.clientHeight,
			behavior: "smooth"
		});
	}, [queue.length, setIndex]);
	(0, import_react.useEffect)(() => {
		const root = scroller.current;
		if (!root) return;
		const expected = index * root.clientHeight;
		if (Math.abs(root.scrollTop - expected) > 2) root.scrollTo({
			top: expected,
			behavior: "auto"
		});
	}, [index, queue]);
	(0, import_react.useEffect)(() => {
		const root = scroller.current;
		if (!root) return;
		const onScroll = () => {
			const i = Math.round(root.scrollTop / (root.clientHeight || 1));
			if (i !== index && i >= 0 && i < queue.length) setIndex(i);
		};
		root.addEventListener("scroll", onScroll, { passive: true });
		return () => root.removeEventListener("scroll", onScroll);
	}, [
		index,
		queue.length,
		setIndex
	]);
	if (!queue.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "type-page",
					children: "The queue is empty"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 type-content text-body",
					children: "You’ve seen, saved, or hidden everything here. Supercharge Taste, switch profile, or turn off English only."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/profile",
					className: "mt-5 block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						children: "Open Taste"
					})
				})
			]
		})
	});
	const start = Math.max(0, index - 1);
	const end = Math.min(queue.length, index + 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-full min-h-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: cn("absolute inset-0 app-scroll snap-y snap-mandatory no-scrollbar", trailerFor && "overflow-hidden"),
			style: { scrollSnapType: "y mandatory" },
			children: queue.map((rec, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full w-full snap-start snap-always",
				style: { minHeight: "100%" },
				children: i >= start && i <= end ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieViewport, {
					rec,
					active: i === index
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full bg-bg" })
			}, rec.movie.id))
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		cinema: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryFeed, {})
	});
}
//#endregion
export { Home as component };
