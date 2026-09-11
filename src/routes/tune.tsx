import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { DiscoveryFeed } from "@/components/discovery/feed";

export const Route = createFileRoute("/tune")({ component: Tune });

function Tune() {
  return (
    <AppShell cinema>
      <DiscoveryFeed mode="tune" />
    </AppShell>
  );
}
