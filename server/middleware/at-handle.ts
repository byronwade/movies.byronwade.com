/** Send /@byron to /u/byron. Vite reserves /@ for internals, so the pretty URL 404s without this. */

export default function atHandleMiddleware(
  event: { url: URL; req: { method: string } },
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();
  const path = event.url.pathname;
  if (
    path.startsWith("/@vite") ||
    path.startsWith("/@fs") ||
    path.startsWith("/@id") ||
    path.startsWith("/@react-refresh")
  ) {
    return next();
  }
  const hit = path.match(/^\/@([A-Za-z][A-Za-z0-9_+]{1,40})$/);
  if (!hit) return next();
  return new Response(null, {
    status: 302,
    headers: { location: `/u/${hit[1]}${event.url.search}` },
  });
}
