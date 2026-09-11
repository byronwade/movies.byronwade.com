import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./cn-DVA-FXpQ.mjs";
import { d as useKino, t as AppShell } from "./shell-DvR4XdT7.mjs";
import { t as Workbench } from "./workbench-CSbQ71gy.mjs";
import { t as Button } from "./button-ChN6QJ9Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tonight-DADpbitr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WHO = [
	"Solo",
	"Partner",
	"Family",
	"Friends"
];
var MOODS = [
	"Funny",
	"Scary",
	"Intense",
	"Quiet",
	"Mind-bending"
];
function Tonight() {
	const nav = useNavigate();
	const tonight = useKino((s) => s.tonight);
	const setTonight = useKino((s) => s.setTonight);
	const [who, setWho] = (0, import_react.useState)(tonight?.who ?? "Solo");
	const [mood, setMood] = (0, import_react.useState)(tonight?.mood ?? null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Workbench, {
		title: "Tonight",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "type-content text-body",
				children: "Session only. This will not rewrite long-term taste."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 mb-2 type-caption uppercase tracking-wide text-marker",
				children: "Who’s watching?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: WHO.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setWho(w),
					className: cn("press h-8 rounded-full px-3 type-chrome", who === w ? "commit" : "well"),
					children: w
				}, w))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 mb-2 type-caption uppercase tracking-wide text-marker",
				children: "Mood"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMood(mood === m ? null : m),
					className: cn("press h-8 rounded-full px-3 type-chrome", mood === m ? "commit" : "well"),
					children: m
				}, m))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-8 w-full",
				onClick: () => {
					setTonight({
						who,
						mood
					});
					nav({ to: "/" });
				},
				children: "Rank tonight"
			}),
			tonight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-3 flex h-11 w-full items-center justify-center type-chrome text-body",
				onClick: () => {
					setTonight(null);
					nav({ to: "/" });
				},
				children: "Clear tonight"
			}) : null
		]
	}) });
}
//#endregion
export { Tonight as component };
