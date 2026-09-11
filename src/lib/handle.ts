export const HANDLE_HOST = "movies.byronwade.com";

export const RESERVED_HANDLES = new Set([
  "live",
  "login",
  "profile",
  "search",
  "saved",
  "tonight",
  "tune",
  "algorithm",
  "movie",
  "api",
  "admin",
  "settings",
  "u",
  "you",
  "kino",
  "movies",
  "www",
  "help",
  "about",
  "stats",
  "index",
]);

export function normalizeHandle(raw: string) {
  return raw.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
}

export function splitHandles(raw: string) {
  return raw
    .split(/[+&,]/)
    .map((part) => normalizeHandle(part))
    .filter(Boolean);
}

export function collisionPath(a: string, b: string) {
  return `/u/${normalizeHandle(a)}+${normalizeHandle(b)}`;
}

export function handleError(handle: string) {
  if (handle.length < 3) return "At least 3 letters.";
  if (handle.length > 20) return "Keep it under 20.";
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(handle)) return "Start with a letter. Use a–z, 0–9, underscore.";
  if (RESERVED_HANDLES.has(handle)) return "That name is reserved.";
  return null;
}

export function suggestedHandle(raw: string) {
  const parts = raw
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const first = parts[0] ?? "";
  if (!handleError(first)) return first;
  const glued = parts.join("");
  if (!handleError(glued)) return glued;
  const clipped = glued.slice(0, 20);
  if (!handleError(clipped)) return clipped;
  return "";
}

export function handleUrl(handle: string) {
  const host =
    typeof window !== "undefined" && window.location?.host ? window.location.host : HANDLE_HOST;
  return `${host}${handlePath(handle)}`;
}

export function handlePath(handle: string) {
  const parts = splitHandles(handle);
  if (parts.length >= 2) return collisionPath(parts[0]!, parts[1]!);
  return `/u/${normalizeHandle(handle)}`;
}
