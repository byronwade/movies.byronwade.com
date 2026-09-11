import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./cn-DVA-FXpQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ios-gJAH5UQi.js
var import_jsx_runtime = require_jsx_runtime();
function Group({ header, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className,
		children: [header ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 px-1 type-caption uppercase tracking-wide text-marker",
			children: header
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "group divide-y divide-fg/5",
			children
		})]
	});
}
function GroupRow({ label, detail, trailing, onClick }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 type-content",
			children: label
		}),
		detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "type-caption text-marker",
			children: detail
		}) : null,
		trailing
	] });
	if (onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "press flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left",
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-11 items-center gap-3 px-4 py-2",
		children: inner
	});
}
function NativeSwitch({ checked, onChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		onClick: () => onChange(!checked),
		className: cn("relative h-7 w-11 rounded-full", checked ? "commit" : "well"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-6 rounded-full bg-fg transition-transform duration-150", checked ? "translate-x-4" : "translate-x-0.5") })
	});
}
function SearchField({ value, onChange, placeholder, onSubmit, inputRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			onSubmit?.();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			className: "well h-12 w-full rounded-full px-4 type-content outline-none placeholder:text-marker"
		})
	});
}
//#endregion
export { SearchField as i, GroupRow as n, NativeSwitch as r, Group as t };
