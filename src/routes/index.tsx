import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { DiscoveryFeed } from "@/components/discovery/feed";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell cinema>
      <DiscoveryFeed />
    </AppShell>
  );
}
