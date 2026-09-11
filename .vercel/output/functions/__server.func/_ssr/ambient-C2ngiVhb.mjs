import { r as createServerFn } from "./ssr.mjs";
import { l as parseMailLibrary } from "./import-BleDzmfj.mjs";
import { Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { n as isLoginRequired } from "./login-CTtj0eor.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ambient-C2ngiVhb.js
function classifyCallToolError(result) {
	if (result.ok) return null;
	const detail = result.errorMessage || void 0;
	const raw = (result.errorMessage ?? "").toLowerCase();
	if (isLoginRequired(result)) return {
		kind: "login",
		message: "Continue with Grok to load your data.",
		detail
	};
	if (raw.includes("not_connected") || raw.includes("failed_precondition")) return {
		kind: "not_connected",
		message: "Connect this connector in Grok to load your data.",
		detail
	};
	if (raw.includes("scope_denied")) return {
		kind: "scope_denied",
		message: "This view isn't available — the app requested a tool outside its grant.",
		detail
	};
	if (raw.includes("access_denied")) return {
		kind: "access_denied",
		message: "You don't have access to this data.",
		detail
	};
	return {
		kind: "error",
		message: detail ?? "Something went wrong. Try again.",
		detail
	};
}
var QUERIES = [
	"from:(fandango.com OR amctheatres.com OR atomtickets.com) (confirmation OR ticket OR purchase OR refund) newer_than:8y",
	"from:netflix.com (\"because you watched\" OR \"you watched\" OR continue) newer_than:5y",
	"from:letterboxd.com OR subject:(ticket OR blu-ray OR watched) newer_than:5y"
];
function collectMessageIds(value, into, depth = 0) {
	if (depth > 8 || value == null) return;
	if (Array.isArray(value)) {
		for (const item of value) collectMessageIds(item, into, depth + 1);
		return;
	}
	if (typeof value !== "object") return;
	const rec = value;
	for (const key of [
		"message_id",
		"messageId",
		"id"
	]) {
		const v = rec[key];
		if (typeof v === "string" && v.length >= 8 && v.length < 80) into.push(v);
	}
	for (const item of Object.values(rec)) collectMessageIds(item, into, depth + 1);
}
function needsGrokLogin(errorMessage) {
	if (!errorMessage) return false;
	return /missing_connector|cannot resolve gate|login required/i.test(errorMessage);
}
var pullMailLibrary_createServerFn_handler = createServerRpc({
	id: "0db941931ccf4e2d979316ead45c780ed465dc80e2c2766feb3bb57fcb0241cd",
	name: "pullMailLibrary",
	filename: "src/lib/server/ambient.ts"
}, (opts) => pullMailLibrary.__executeServer(opts));
var pullMailLibrary = createServerFn({ method: "POST" }).validator((input) => object({}).parse(input ?? {})).handler(pullMailLibrary_createServerFn_handler, async () => {
	try {
		const { callTool, getConnectorAccessToken, ConnectorType, GmailTools } = await import("./client.server-6VNAN2KX.mjs");
		const hasToken = Boolean(getConnectorAccessToken());
		const options = { connectorType: ConnectorType.Gmail };
		const results = await Promise.all(QUERIES.map((query) => callTool(GmailTools.search, {
			query,
			max_results: 20
		}, options)));
		let loginRequired = false;
		let loginUrl;
		let error;
		const blobs = [];
		for (const result of results) {
			if (result.loginRequired || needsGrokLogin(result.errorMessage)) {
				loginRequired = true;
				loginUrl = result.loginUrl ?? loginUrl;
				error = classifyCallToolError(result)?.message ?? result.errorMessage ?? error;
				continue;
			}
			if (!result.ok) {
				error = classifyCallToolError(result)?.message ?? result.errorMessage ?? error;
				continue;
			}
			if (result.data != null) blobs.push(result.data);
		}
		if (loginRequired && blobs.length === 0) return {
			hits: [],
			loginRequired: true,
			loginUrl,
			hasToken,
			error
		};
		let hits = parseMailLibrary(blobs);
		if (!hits.length) {
			const ids = [];
			for (const blob of blobs) collectMessageIds(blob, ids);
			const unique = [...new Set(ids)].slice(0, 8);
			if (unique.length) {
				const extraData = (await Promise.all(unique.map((message_id) => callTool(GmailTools.getMessage, { message_id }, options)))).filter((r) => r.ok && r.data != null).map((r) => r.data);
				hits = parseMailLibrary([...blobs, ...extraData]);
			}
		}
		const uniq = /* @__PURE__ */ new Map();
		for (const h of hits) uniq.set(h.movieId, h);
		return {
			hits: [...uniq.values()],
			hasToken,
			error: uniq.size ? void 0 : error
		};
	} catch {
		return {
			hits: [],
			hasToken: false,
			loginRequired: true
		};
	}
});
//#endregion
export { pullMailLibrary_createServerFn_handler };
