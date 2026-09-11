//#region node_modules/.nitro/vite/services/ssr/assets/login-CTtj0eor.js
function isLoginRequired(result) {
	return result.ok === false && result.loginRequired === true;
}
function hrefCandidates() {
	const out = [];
	try {
		if (window.location.href) out.push(window.location.href);
	} catch {}
	try {
		if (document.referrer) out.push(document.referrer);
	} catch {}
	return out;
}
function connectorLoginUrl(explicit) {
	if (explicit) return explicit;
	if (typeof window === "undefined") return void 0;
	for (const href of hrefCandidates()) try {
		const page = new URL(href.includes("://") ? href : `https://${href}`);
		const host = page.hostname.toLowerCase();
		if (!host || host === "localhost" || host === "127.0.0.1" || host === "[::1]") continue;
		const origin = `${page.protocol}//${page.host}`;
		const ret = `${origin}/profile`;
		if (host.endsWith(".grok-sandbox.com") || host.endsWith(".grok.me") || host.endsWith(".app-builder-testing.com")) return `${origin}/__gate/signin?return_to=${encodeURIComponent(ret)}`;
		return `https://gate.grok.me/__gate/signin?return_to=${encodeURIComponent(ret)}`;
	} catch {
		continue;
	}
	return "https://gate.grok.me/__gate/signin";
}
function continueWithGrok(result = { loginRequired: true }) {
	const url = connectorLoginUrl(result.loginUrl);
	if (!url || typeof window === "undefined") return false;
	try {
		const popup = window.open(url, "kino-grok-gate", "popup,width=520,height=720");
		if (popup) {
			try {
				popup.opener = null;
			} catch {}
			return true;
		}
	} catch {}
	return false;
}
function redirectToLoginIfRequired(result) {
	if (!isLoginRequired(result)) return false;
	const url = result.loginUrl;
	if (!url) return false;
	if (typeof window === "undefined") return false;
	if (continueWithGrok(result)) return true;
	window.location.assign(url);
	return true;
}
//#endregion
export { isLoginRequired as n, redirectToLoginIfRequired as r, connectorLoginUrl as t };
