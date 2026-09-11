import { createFileRoute } from "@tanstack/react-router";
import { dbSource, getSql } from "@/lib/db";
import { MOVIES } from "@/catalog/movies";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let database: "ok" | "down" = "down";
        try {
          const sql = await getSql();
          await sql.query("select 1");
          database = "ok";
        } catch {
          database = "down";
        }
        return Response.json({
          ok: database === "ok",
          app: "movies",
          database,
          source: dbSource,
          catalog: MOVIES.length,
        });
      },
    },
  },
});
