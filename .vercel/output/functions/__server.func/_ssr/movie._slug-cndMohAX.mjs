import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getMovieBySlug, t as LANGUAGE_LABEL } from "./import-BleDzmfj.mjs";
import { a as Play } from "../_libs/lucide-react.mjs";
import { d as useKino, o as StillImage, t as AppShell } from "./shell-DvR4XdT7.mjs";
import { t as Workbench } from "./workbench-CSbQ71gy.mjs";
import { t as Button } from "./button-ChN6QJ9Z.mjs";
import { n as Route$1 } from "./router-C1Q_u6JZ.mjs";
import { t as MovieActions } from "./actions-C3WvTIcz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/movie._slug-cndMohAX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MoviePage() {
	const { slug } = Route$1.useParams();
	const movie = getMovieBySlug(slug);
	const rec = useKino((s) => movie ? s.ranks[movie.id] : void 0);
	const record = useKino((s) => s.record);
	const openTrailer = useKino((s) => s.openTrailer);
	(0, import_react.useEffect)(() => {
		if (movie) record("details_opened", movie.id, { source: "page" });
	}, [movie, record]);
	if (!movie) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Workbench, {
		title: "KINO",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "type-page",
			children: "Not in the catalog"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-5 block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				children: "For you"
			})
		})]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Workbench, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "type-caption text-accent",
			children: "Back"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StillImage, {
			slug: movie.slug,
			atmosphere: movie.atmosphere,
			kind: "cover",
			className: "mt-4 aspect-video w-full rounded-lg"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 type-chrome text-accent",
			children: [
				movie.year,
				" · ",
				movie.certification,
				" · ",
				movie.runtimeMin,
				"m",
				movie.language !== "en" ? ` · ${LANGUAGE_LABEL[movie.language] ?? movie.language}` : ""
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 type-page",
			children: movie.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 type-content text-body",
			children: movie.director
		}),
		rec ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 font-mono type-caption text-accent",
			children: [
				rec.tasteRank,
				" · ",
				rec.matchLabel
			]
		}) : null,
		movie.trailerYoutubeId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "press commit mt-5 flex h-11 w-full items-center justify-center gap-2 type-content",
			onClick: () => openTrailer(movie.id),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), "Trailer"]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieActions, {
			movie,
			className: "mt-5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 type-content leading-relaxed",
			children: movie.overview
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 type-caption text-body",
			children: movie.themes.join(" · ")
		})
	] }) });
}
//#endregion
export { MoviePage as component };
