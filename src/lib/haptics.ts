export function tap(kind: "light" | "ok" | "warn" = "light") {
  try {
    navigator.vibrate?.(kind === "warn" ? [8, 24, 8] : kind === "ok" ? 12 : 8);
  } catch {
    /* ignore */
  }
}
