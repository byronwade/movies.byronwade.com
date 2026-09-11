import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as MOVIES, t as LANGUAGE_LABEL } from "./import-BleDzmfj.mjs";
import { d as useKino, o as StillImage, t as AppShell } from "./shell-DvR4XdT7.mjs";
import { t as Workbench } from "./workbench-CSbQ71gy.mjs";
import { i as SearchField } from "./ios-gJAH5UQi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-CK0hOFIo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const ranks = useKino((s) => s.ranks);
	const movieState = useKino((s) => s.movieState);
	const record = useKino((s) => s.record);
	const englishOnly = useKino((s) => s.englishOnly);
	const query = q.trim().toLowerCase();
	const results = (0, import_react.useMemo)(() => {
		return [...query ? MOVIES.filter((m) => `${m.title} ${m.director} ${m.cast.map((c) => c.name).join(" ")}`.toLowerCase().includes(query)) : MOVIES.filter((m) => !movieState[m.id]?.notInterested && (!englishOnly || m.language === "en"))].sort((a, b) => (ranks[b.id]?.tasteRank ?? 0) - (ranks[a.id]?.tasteRank ?? 0)).slice(0, query ? 20 : 14);
	}, [
		query,
		ranks,
		movieState,
		englishOnly
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Workbench, {
		title: "Search",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchField, {
			value: q,
			onChange: setQ,
			placeholder: "Film, director, actor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4",
			children: results.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/movie/$slug",
				params: { slug: m.slug },
				className: "flex min-h-11 items-center gap-3 py-2",
				onClick: () => {
					if (query.length >= 2) record("search", m.id, { source: "search" });
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StillImage, {
						slug: m.slug,
						atmosphere: m.atmosphere,
						className: "h-16 w-11 shrink-0 rounded-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate type-content font-medium",
							children: m.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block type-caption text-body",
							children: [
								m.year,
								", ",
								m.director,
								m.language !== "en" ? ` · ${LANGUAGE_LABEL[m.language] ?? m.language}` : ""
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono type-caption text-marker",
						children: ranks[m.id]?.tasteRank ?? "—"
					})
				]
			}) }, m.id))
		})]
	}) });
}
//#endregion
export { SearchPage as component };
