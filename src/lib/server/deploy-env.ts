/**
 * Runtime fallbacks when this app is on Vercel without Grok-deployer injection.
 * Preview (`*.grok-sandbox.com`) already has DATABASE_URL from startup.sh.
 * Secrets match startup.sh so sandbox and production share the same Neon.
 */
const NEON_POOLED =
  "postgresql://neondb_owner:npg_I81bCNcDVlGa@ep-proud-resonance-au9tos7l-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";
const NEON_DIRECT =
  "postgresql://neondb_owner:npg_I81bCNcDVlGa@ep-proud-resonance-au9tos7l.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require";
const AUTH_SECRET = "829307ea8a4025a2bf012f5aa8df2744336c8186819ea3950a40f98abc055d92";

function empty(key: string) {
  const v = typeof process === "undefined" ? "" : process.env[key]?.trim();
  return !v;
}

if (typeof process !== "undefined") {
  if (empty("DATABASE_URL")) process.env.DATABASE_URL = NEON_POOLED;
  if (empty("DATABASE_URL_UNPOOLED")) process.env.DATABASE_URL_UNPOOLED = NEON_DIRECT;
  if (empty("BETTER_AUTH_SECRET")) process.env.BETTER_AUTH_SECRET = AUTH_SECRET;
}

export const DEPLOY_DATABASE_URL = NEON_POOLED;
export const DEPLOY_AUTH_SECRET = AUTH_SECRET;
