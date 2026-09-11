import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workbench-CSbQ71gy.js
var import_jsx_runtime = require_jsx_runtime();
function Workbench({ title, trailing, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [title ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-12 shrink-0 items-center justify-between px-5",
			style: {
				paddingTop: "var(--safe-top)",
				height: "calc(3rem + var(--safe-top))"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "type-section",
				children: title
			}), trailing]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "app-scroll min-h-0 flex-1 px-5 pb-8",
			children
		})]
	});
}
//#endregion
export { Workbench as t };
