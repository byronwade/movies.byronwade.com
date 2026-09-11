import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as useKino, t as AppShell, u as topAffinities } from "./shell-DvR4XdT7.mjs";
import { t as TasteGraph } from "./graph--ws7dxQV.mjs";
import { t as Workbench } from "./workbench-CSbQ71gy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/algorithm-Dgc_0mNd.js
var import_jsx_runtime = require_jsx_runtime();
function Algorithm() {
	const taste = useKino((s) => s.taste);
	const events = useKino((s) => s.events);
	const genres = topAffinities(taste, "genre:", 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Workbench, {
		title: "Evidence",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/profile",
				className: "type-caption text-accent",
				children: "Taste"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 type-content text-body",
				children: [events.length, " events. Not collaborative filtering. Your taste × film attributes × novelty × quality."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "group mt-6 px-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasteGraph, { taste })
			}),
			genres.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 type-caption text-marker",
				children: genres.map((g) => g.name).join(" · ")
			}) : null
		]
	}) });
}
//#endregion
export { Algorithm as component };
