import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseMailLibrary, type ImportHit } from "@/tasterank";
import { classifyCallToolError } from "@/lib/app-data/errors";

const QUERIES = [
  "from:(fandango.com OR amctheatres.com OR atomtickets.com OR regmovies.com) (confirmation OR ticket OR purchase) newer_than:8y",
  'from:netflix.com ("because you watched" OR "you watched" OR continue OR "recently watched") newer_than:5y',
  "from:(hulu.com OR disneyplus.com OR max.com OR hbomax.com) (watched OR continue OR movie) newer_than:5y",
  "from:letterboxd.com newer_than:5y",
];

function collectMessageIds(value: unknown, into: string[], depth = 0) {
  if (depth > 8 || value == null) return;
  if (Array.isArray(value)) {
    for (const item of value) collectMessageIds(item, into, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  const rec = value as Record<string, unknown>;
  for (const key of ["message_id", "messageId", "id"]) {
    const v = rec[key];
    if (typeof v === "string" && v.length >= 8 && v.length < 80) into.push(v);
  }
  for (const item of Object.values(rec)) collectMessageIds(item, into, depth + 1);
}

function needsGrokLogin(errorMessage?: string) {
  if (!errorMessage) return false;
  return /missing_connector|cannot resolve gate|login required/i.test(errorMessage);
}

export const pullMailLibrary = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async (): Promise<{
    hits: ImportHit[];
    loginRequired?: boolean;
    loginUrl?: string;
    hasToken?: boolean;
    connected?: boolean;
    searched?: number;
    error?: string;
  }> => {
    try {
      const { callTool, getConnectorAccessToken, ConnectorType, GmailTools } = await import(
        "@/lib/app-data/client.server"
      );
      const hasToken = Boolean(getConnectorAccessToken());
      const options = { connectorType: ConnectorType.Gmail };
      const results = await Promise.all(
        QUERIES.map((query) => callTool(GmailTools.search, { query, max_results: 20 }, options)),
      );

      let loginRequired = false;
      let loginUrl: string | undefined;
      let error: string | undefined;
      const blobs: unknown[] = [];
      for (const result of results) {
        if (result.loginRequired || needsGrokLogin(result.errorMessage)) {
          loginRequired = true;
          loginUrl = result.loginUrl ?? loginUrl;
          const classified = classifyCallToolError(result);
          error = classified?.message ?? result.errorMessage ?? error;
          continue;
        }
        if (!result.ok) {
          const classified = classifyCallToolError(result);
          error = classified?.message ?? result.errorMessage ?? error;
          continue;
        }
        if (result.data != null) blobs.push(result.data);
      }

      if (loginRequired && blobs.length === 0) {
        return { hits: [], loginRequired: true, loginUrl, hasToken, error };
      }

      let hits = parseMailLibrary(blobs);
      if (!hits.length) {
        const ids: string[] = [];
        for (const blob of blobs) collectMessageIds(blob, ids);
        const unique = [...new Set(ids)].slice(0, 8);
        if (unique.length) {
          const extras = await Promise.all(
            unique.map((message_id) => callTool(GmailTools.getMessage, { message_id }, options)),
          );
          const extraData = extras.filter((r) => r.ok && r.data != null).map((r) => r.data);
          hits = parseMailLibrary([...blobs, ...extraData]);
        }
      }

      const uniq = new Map<string, ImportHit>();
      for (const h of hits) uniq.set(h.movieId, h);
      const connected = !loginRequired || blobs.length > 0;
      return {
        hits: [...uniq.values()],
        hasToken,
        connected,
        loginRequired: loginRequired && blobs.length === 0,
        loginUrl,
        searched: blobs.length,
        error: uniq.size ? undefined : error,
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : "Gmail failed.";
      const loginRequired = /unauthor/i.test(error);
      return { hits: [], hasToken: false, connected: false, loginRequired, error };
    }
  });

export const probeGmail = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async (): Promise<{
    connected: boolean;
    loginRequired?: boolean;
    loginUrl?: string;
    error?: string;
  }> => {
    try {
      const { callTool, getConnectorAccessToken, ConnectorType, GmailTools } = await import(
        "@/lib/app-data/client.server"
      );
      const hasToken = Boolean(getConnectorAccessToken());
      if (hasToken) return { connected: true };
      const result = await callTool(
        GmailTools.search,
        { query: "in:inbox", max_results: 1 },
        { connectorType: ConnectorType.Gmail },
      );
      if (result.loginRequired || needsGrokLogin(result.errorMessage)) {
        return {
          connected: false,
          loginRequired: true,
          loginUrl: result.loginUrl,
          error: classifyCallToolError(result)?.message ?? "Continue with Grok to connect Gmail.",
        };
      }
      if (!result.ok) {
        const classified = classifyCallToolError(result);
        const login = classified?.kind === "login" || classified?.kind === "not_connected";
        return {
          connected: hasToken && !login,
          loginRequired: login,
          error: classified?.message ?? result.errorMessage ?? "Gmail did not answer.",
        };
      }
      return { connected: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : "Could not reach Grok.";
      return { connected: false, loginRequired: /unauthor/i.test(error), error };
    }
  });
