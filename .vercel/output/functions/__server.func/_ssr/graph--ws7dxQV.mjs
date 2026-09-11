import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./cn-DVA-FXpQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/graph--ws7dxQV.js
var import_jsx_runtime = require_jsx_runtime();
function group(taste, prefix, kind, limit = 5) {
	return Object.entries(taste.affinities).filter(([k, v]) => k.startsWith(prefix) && Math.abs(v) > .2).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, limit).map(([key, value]) => ({
		key,
		name: key.slice(prefix.length).replace(/\b\w/g, (c) => c.toUpperCase()),
		value: Math.round(value * 100) / 100,
		kind
	}));
}
function signatureLabel(genres, themes, tones) {
	const g = (genres[0]?.name ?? "").toLowerCase();
	const bag = new Set([...themes, ...tones].map((n) => n.name.toLowerCase()));
	if (g.includes("science") && (bag.has("cosmic horror") || bag.has("alien biology") || bag.has("dread"))) return "Dark sci-fi";
	if (g.includes("science") && (bag.has("power") || bag.has("prophecy") || bag.has("ecology"))) return "Epic sci-fi";
	if (g.includes("science") && (bag.has("language") || bag.has("first contact") || bag.has("ai"))) return "Cerebral sci-fi";
	if (g.includes("horror")) return "Horror";
	if (g.includes("animation") || g.includes("fantasy")) return "Wonder";
	if (g.includes("crime") || g.includes("thriller")) return "Crime & tension";
	if (genres[0]) return genres[0].name;
	if (themes[0]) return themes[0].name;
	return "Taste";
}
function tasteGraph(taste) {
	const genres = group(taste, "genre:", "genre", 4);
	const themes = group(taste, "theme:", "theme", 5);
	const tones = group(taste, "tone:", "tone", 4);
	const people = [...group(taste, "director:", "person", 3), ...group(taste, "actor:", "person", 2)];
	const negative = Object.entries(taste.affinities).filter(([, v]) => v < -.25).sort((a, b) => a[1] - b[1]).slice(0, 4).map(([key, value]) => ({
		key,
		name: (key.split(":")[1] ?? key).replace(/\b\w/g, (c) => c.toUpperCase()),
		value: Math.round(value * 100) / 100,
		kind: "negative"
	}));
	const roots = [];
	const nested = [...themes, ...tones].slice(0, 5);
	if (genres.length || nested.length) {
		const name = signatureLabel(genres, themes, tones);
		const head = genres[0] ?? nested[0];
		roots.push({
			key: "signature",
			name,
			value: head.value,
			kind: "genre",
			children: nested.length ? nested : genres.slice(0, 4)
		});
	}
	if (genres.length > 1) roots.push({
		key: "genres",
		name: "Also in the mix",
		value: genres[1]?.value ?? 0,
		kind: "genre",
		children: genres.slice(1)
	});
	if (people.length) roots.push({
		key: "people",
		name: "People",
		value: people[0]?.value ?? 0,
		kind: "person",
		children: people
	});
	if (negative.length) roots.push({
		key: "no",
		name: "Leave out",
		value: negative[0]?.value ?? 0,
		kind: "negative",
		children: negative
	});
	return roots;
}
function profileSummary(taste) {
	const sig = tasteGraph(taste)[0];
	if (!sig) return "TasteRank is still watching how you watch. Hide, linger, import.";
	const kids = (sig.children ?? []).slice(0, 2).map((n) => n.name.toLowerCase());
	const extra = kids.length ? ` Drawn to ${kids.join(" and ")}.` : "";
	return `${sig.name}.${extra}`;
}
function TasteGraph({ taste }) {
	const roots = tasteGraph(taste);
	if (!roots.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "type-content text-body",
		children: "Hide a few, linger on a few, import a list. The graph fills in."
	});
	const max = Math.max(...roots.flatMap((r) => (r.children ?? [r]).map((c) => Math.abs(c.value))), 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: roots.map((root) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-2 type-caption uppercase tracking-wide text-marker",
			children: root.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: (root.children ?? [root]).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "type-chrome",
					children: n.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono type-caption text-marker",
					children: n.value.toFixed(2)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("graph-bar", n.kind === "negative" && "neg"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${Math.min(100, Math.abs(n.value) / max * 100)}%` } })
			})] }, n.key))
		})] }, root.key))
	});
}
//#endregion
export { profileSummary as n, TasteGraph as t };
