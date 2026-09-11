import { createFileRoute } from "@tanstack/react-router";
import { rememberInboundConnector } from "@/lib/app-data/client.server";

export const Route = createFileRoute("/api/grok-status")({
  server: {
    handlers: {
      GET: () => {
        const ctx = rememberInboundConnector();
        return Response.json({
          connected: Boolean(ctx.token),
          host: ctx.publicHost,
        });
      },
    },
  },
});
