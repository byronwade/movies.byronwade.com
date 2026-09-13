import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { NativeSheet } from "@/components/chrome/sheet";
import { Button } from "@/components/ui/button";
import { useKino } from "@/lib/store";
import { signalCount, TRAIN_GOAL } from "@/tasterank";
import { connectorLoginUrl } from "@/lib/app-data/login";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const SKIP = "kino.skipOnboard";

export function FirstRun() {
  const events = useKino((s) => s.events);
  const pendingAsks = useKino((s) => s.pendingAsks);
  const checkGrok = useKino((s) => s.checkGrok);
  const scanMail = useKino((s) => s.scanMail);
  const scanning = useKino((s) => s.scanning);
  const gmail = useKino((s) => s.gmail);
  const { user } = useCurrentUserState();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const n = signalCount(events);

  useEffect(() => {
    if (pendingAsks.length) {
      setOpen(false);
      return;
    }
    let skip = false;
    try {
      skip = localStorage.getItem(SKIP) === "1";
    } catch {
      /* ignore */
    }
    setOpen(
      !skip &&
        n < 8 &&
        pathname !== "/tune" &&
        pathname !== "/login" &&
        pathname !== "/search" &&
        pathname !== "/saved" &&
        pathname !== "/profile" &&
        pathname !== "/live" &&
        pathname !== "/algorithm" &&
        !pathname.startsWith("/movie/") &&
        !pathname.startsWith("/u/") &&
        !pathname.startsWith("/@"),
    );
  }, [n, pendingAsks.length, pathname]);

  if (!open) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(SKIP, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const goTune = () => {
    dismiss();
    void nav({ to: "/tune" });
  };

  const connect = async () => {
    setBusy(true);
    try {
      if (!user) {
        dismiss();
        void nav({ to: "/login" });
        return;
      }
      const grok = await checkGrok();
      if (!grok.connected) {
        const href = connectorLoginUrl(grok.loginUrl) ?? "https://gate.grok.me/__gate/signin";
        try {
          sessionStorage.setItem("kino.mail.grok", "1");
        } catch {
          /* ignore */
        }
        window.location.assign(href);
        return;
      }
      const scan = await scanMail();
      if (scan.ok || (scan.count ?? 0) > 0) dismiss();
      else goTune();
    } finally {
      setBusy(false);
    }
  };

  return (
    <NativeSheet open onClose={dismiss} label="Teach For you">
      <p className="type-caption uppercase tracking-wide text-marker">For you</p>
      <h2 className="mt-1 type-section">Teach the algorithm first</h2>
      <p className="mt-2 type-content text-body">
        Connect Grok and scan Gmail for tickets and watch mail. If we can’t, Fine Tune {TRAIN_GOAL} films you already know. For you gets sharp after that.
      </p>
      <Button className="mt-5 w-full" disabled={busy || scanning} onClick={() => void connect()}>
        {busy || scanning ? "Connecting…" : gmail.grok === "connected" ? "Scan Gmail" : "Connect Grok & Gmail"}
      </Button>
      <Button variant="ghost" className="mt-2 w-full" onClick={goTune}>
        Fine tune {TRAIN_GOAL} films
      </Button>
      <button type="button" className="mt-2 flex h-11 w-full items-center justify-center type-chrome text-body" onClick={dismiss}>
        I’ll do it later
      </button>
    </NativeSheet>
  );
}
