import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./cn-DVA-FXpQ.mjs";
import { o as Eye, r as SkipForward, s as EyeOff, u as Bookmark } from "../_libs/lucide-react.mjs";
import { d as useKino } from "./shell-DvR4XdT7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-C3WvTIcz.js
var import_jsx_runtime = require_jsx_runtime();
function MovieActions({ movie, className }) {
	const record = useKino((s) => s.record);
	const state = useKino((s) => s.movieState[movie.id]);
	const hidden = Boolean(state?.notInterested);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
				label: state?.seen ? "Seen" : "Watch",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
					className: "size-7",
					strokeWidth: 1.6,
					fill: state?.seen ? "currentColor" : "none"
				}),
				active: state?.seen,
				onClick: () => record("seen", movie.id, { label: "Marked seen" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
				label: state?.saved ? "Saved" : "Save",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
					className: "size-7",
					strokeWidth: 1.6,
					fill: state?.saved ? "currentColor" : "none"
				}),
				active: state?.saved,
				onClick: () => record(state?.saved ? "unsave" : "save", movie.id, { label: state?.saved ? "Removed" : "Saved" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
				label: "Skip",
				hint: "Skip — show again later",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, {
					className: "size-7",
					strokeWidth: 1.6
				}),
				onClick: () => record("skip", movie.id, { label: "Skipped" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
				label: hidden ? "Hidden" : "Not interested",
				hint: "Not interested — don’t show again",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
					className: "size-7",
					strokeWidth: 1.6,
					fill: hidden ? "currentColor" : "none"
				}),
				active: hidden,
				onClick: () => {
					if (!hidden) record("not_interested", movie.id, { label: "Not interested" });
				}
			})
		]
	});
}
function Action({ label, hint, icon, onClick, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-label": hint ?? label,
		className: "press flex min-w-0 flex-1 flex-col items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-11 place-items-center text-fg",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("px-0.5 text-center type-caption leading-tight", active ? "text-fg" : "text-body"),
			children: label
		})]
	});
}
//#endregion
export { MovieActions as t };
