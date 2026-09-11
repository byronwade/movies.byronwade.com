import { useEffect, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useKino } from "@/lib/store";
import { TabBar } from "./tab-bar";
import { UndoToast } from "./undo-toast";
import { NoticeHost, AppErrorBoundary } from "./notice";
import { TrailerOverlay } from "@/components/movie/trailer";
import { HouseholdAsk } from "@/components/household/ask";
import { FirstRun } from "@/components/onboarding/first-run";

export function AppShell({ children }: { children: ReactNode; cinema?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  const hydrate = useKino((s) => s.hydrate);
  const flash = useKino((s) => s.flash);

  useEffect(() => {
    if (isPending) return;
    if (user) {
      void hydrate({ userId: user.id, signedIn: true });
      return;
    }
    void hydrate({ userId: "guest", signedIn: false });
  }, [hydrate, isPending, user]);

  useEffect(() => {
    if (!authEnabled) return;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      void authClient.getSession();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);

  useEffect(() => {
    const flush = () => {
      useKino.getState().flushSync();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  useEffect(() => {
    let live = true;
    void fetch("/api/grok-status", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { connected?: boolean } | null) => {
        if (!live || !body?.connected) return;
        useKino.getState().markGrokConnected();
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const on = () => flash({ kind: "ok", title: "Back online" });
    const off = () =>
      flash({
        kind: "err",
        title: "You're offline",
        body: "Marks save on this device until the network returns.",
      });
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if (typeof navigator !== "undefined" && navigator.onLine === false) off();
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [flash]);

  return (
    <AppErrorBoundary>
      <div className="screen">
        <NoticeHost />
        <div className="stage">{children}</div>
        <TabBar />
        <UndoToast />
        <TrailerOverlay />
        <HouseholdAsk />
        <FirstRun />
      </div>
    </AppErrorBoundary>
  );
}
