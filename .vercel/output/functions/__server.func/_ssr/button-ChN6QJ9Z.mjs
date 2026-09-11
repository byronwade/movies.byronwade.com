import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./cn-DVA-FXpQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-ChN6QJ9Z.js
var import_jsx_runtime = require_jsx_runtime();
var variants = {
	solid: "commit text-fg",
	ghost: "well text-fg",
	danger: "well text-danger"
};
var sizes = {
	lg: "h-12 px-4 type-content",
	md: "h-11 px-3 type-chrome"
};
function Button({ variant = "solid", size = "lg", className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("press rounded-full", variants[variant], sizes[size], className),
		...props
	});
}
function buttonVariants({ variant = "solid", size = "lg" } = {}) {
	return cn("press inline-flex items-center justify-center rounded-full", variants[variant], sizes[size]);
}
//#endregion
export { buttonVariants as n, Button as t };
