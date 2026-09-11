import type { CallToolResult } from "./types.ts";

export function isLoginRequired(result: CallToolResult): boolean {
  return result.ok === false && result.loginRequired === true;
}

const GATE_PROD = "https://gate.grok.me";
const GATE_STAGING = "https://gate.app-builder-testing.com";

export function publicGateSigninUrl(returnTo?: string): string {
  let origin = GATE_PROD;
  try {
    if (returnTo) {
      const host = new URL(returnTo).hostname.toLowerCase();
      if (host === "app-builder-testing.com" || host.endsWith(".app-builder-testing.com")) {
        origin = GATE_STAGING;
      }
    }
  } catch {
    /* keep prod */
  }
  const path = `${origin}/__gate/signin`;
  return returnTo ? `${path}?return_to=${encodeURIComponent(returnTo)}` : path;
}

function isPreviewHost(host: string): boolean {
  return (
    host.endsWith(".grok-sandbox.com") ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]"
  );
}

function rewriteBrokenGateUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.pathname.replace(/\/+$/, "") !== "/__gate/signin") return raw;
    if (!isPreviewHost(url.hostname.toLowerCase())) return raw;
    return publicGateSigninUrl(url.searchParams.get("return_to") || undefined);
  } catch {
    return raw;
  }
}

function hrefCandidates(): string[] {
  const out: string[] = [];
  try {
    if (window.location.href) out.push(window.location.href);
  } catch {
    /* ignore */
  }
  try {
    if (document.referrer) out.push(document.referrer);
  } catch {
    /* ignore */
  }
  return out;
}

export function connectorLoginUrl(explicit?: string | null): string | undefined {
  if (explicit) return rewriteBrokenGateUrl(explicit);
  if (typeof window === "undefined") return undefined;
  for (const href of hrefCandidates()) {
    try {
      const page = new URL(href.includes("://") ? href : `https://${href}`);
      const host = page.hostname.toLowerCase();
      if (!host || host === "localhost" || host === "127.0.0.1" || host === "[::1]") continue;
      const origin = `${page.protocol}//${page.host}`;
      const ret = `${origin}/profile`;
      // Live preview is the app itself — it does not serve /__gate/signin.
      // Send the viewer to the real gate, then back here.
      if (isPreviewHost(host)) return publicGateSigninUrl(ret);
      if (host.endsWith(".grok.me") || host.endsWith(".app-builder-testing.com")) {
        return `${origin}/__gate/signin?return_to=${encodeURIComponent(ret)}`;
      }
      return publicGateSigninUrl(ret);
    } catch {
      continue;
    }
  }
  return publicGateSigninUrl();
}

export function continueWithGrok(result: Pick<CallToolResult, "loginRequired" | "loginUrl"> = { loginRequired: true }): boolean {
  const url = connectorLoginUrl(result.loginUrl);
  if (!url || typeof window === "undefined") return false;
  try {
    const popup = window.open(url, "movies-grok-gate", "popup,width=520,height=720");
    if (popup) {
      try {
        popup.opener = null;
      } catch {
        /* ignore */
      }
      return true;
    }
  } catch {
    /* blocked */
  }
  return false;
}

export function redirectToLoginIfRequired(result: CallToolResult): boolean {
  if (!isLoginRequired(result)) return false;
  const url = connectorLoginUrl(result.loginUrl);
  if (!url) return false;
  if (typeof window === "undefined") return false;
  if (continueWithGrok({ loginRequired: true, loginUrl: url })) return true;
  try {
    if (window.top && window.top !== window) {
      window.top.location.assign(url);
      return true;
    }
  } catch {
    /* cross-origin frame */
  }
  window.location.assign(url);
  return true;
}
