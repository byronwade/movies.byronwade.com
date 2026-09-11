import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as listSaved, d as useKino, o as StillImage, t as AppShell } from "./shell-DvR4XdT7.mjs";
import { t as Workbench } from "./workbench-CSbQ71gy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saved-CsdVV4rX.js
var import_jsx_runtime = require_jsx_runtime();
function Saved() {
	const movieState = useKino((s) => s.movieState);
	const rows = listSaved(movieState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workbench, {
		title: "Saved",
		children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "pt-8 type-content text-body",
			children: "Films you keep live here. On For you, tap Save."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "-mx-5 grid grid-cols-3 gap-px",
			children: rows.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/movie/$slug",
				params: { slug: m.slug },
				className: "press block",
				"aria-label": m.title,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StillImage, {
					slug: m.slug,
					atmosphere: m.atmosphere,
					title: m.title,
					className: "aspect-poster w-full"
				})
			}) }, m.id))
		})
	}) });
}
//#endregion
export { Saved as component };
