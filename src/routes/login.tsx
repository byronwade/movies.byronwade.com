import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Navigate, useNavigate, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, captureSessionToken, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/chrome/shell";
import { Button } from "@/components/ui/button";
import { useKino } from "@/lib/store";

export const Route = createFileRoute("/login")({ component: Login });

function tokenFrom(res: { data?: unknown }) {
  const data = res.data as { token?: string; session?: { token?: string } } | null | undefined;
  return data?.token ?? data?.session?.token ?? null;
}

function friendlyAuthError(raw: string) {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid origin")) return "This host isn’t trusted for sign-in yet. Refresh and try email.";
  if (msg.includes("invalid_redirect") || msg.includes("redirect_uri")) {
    return "Google and X only work in the Grok preview. Use email on this site.";
  }
  if (msg.includes("invalid password") || msg.includes("invalid email") || msg.includes("invalid credentials")) {
    return "Email or password doesn’t match.";
  }
  if (msg.includes("user already exists") || msg.includes("already exists")) {
    return "That email already has an account. Sign in instead.";
  }
  return raw;
}

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const nav = useNavigate();
  const router = useRouter();

  const goHome = async () => {
    const session = await Promise.race([
      authClient.getSession(),
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 8000)),
    ]).catch(() => null);
    const uid = (session as { data?: { user?: { id?: string } } } | null)?.data?.user?.id;
    if (!uid) return false;
    try {
      localStorage.setItem("kino.lastUserId", uid);
    } catch {
      /* ignore */
    }
    void useKino.getState().hydrate({ userId: uid, signedIn: true });
    useKino.getState().flash({ kind: "ok", title: "Signed in", body: "Lists and For you save to this account." });
    void router.invalidate();
    await nav({ to: "/" });
    return true;
  };

  useEffect(() => {
    if (busy || isPending || user) return;
    const trySession = () => {
      void goHome();
    };
    window.addEventListener("focus", trySession);
    document.addEventListener("visibilitychange", trySession);
    window.addEventListener("pageshow", trySession);
    return () => {
      window.removeEventListener("focus", trySession);
      document.removeEventListener("visibilitychange", trySession);
      window.removeEventListener("pageshow", trySession);
    };
  }, [busy, isPending, user]);

  if (!busy && !isPending && user) return <Navigate to="/" />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy("email");
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] ?? "viewer",
          callbackURL: "/login",
        });
        if (res.error) {
          setError(friendlyAuthError(res.error.message ?? "Could not create the account."));
          return;
        }
        const token = tokenFrom(res);
        if (token) captureSessionToken(token);
      } else {
        const res = await authClient.signIn.email({ email, password, callbackURL: "/login" });
        if (res.error) {
          setError(friendlyAuthError(res.error.message ?? "Could not sign in."));
          return;
        }
        const token = tokenFrom(res);
        if (token) captureSessionToken(token);
      }
      const ok = await goHome();
      if (!ok) setError("Signed in, but the session didn’t stick. Try again.");
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Could not sign in."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
    <main className="app-scroll relative grid h-full min-h-0 bg-bg px-5" style={{ paddingTop: "var(--safe-top)" }}>
      <div className="mx-auto my-auto w-full max-w-sm py-8">
        <p className="brand !block">movies</p>
        <h1 className="mt-5 type-display">Sign in</h1>
        <p className="mt-2 type-content text-body">Save lists and For you to this account. Grok is only for reading Gmail.</p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                className="w-full"
                disabled={busy !== null}
                onClick={() => {
                  setError(null);
                  setBusy(p.providerId);
                  void signIn(p.providerId, { callbackURL: "/login", errorCallbackURL: "/login" })
                    .then(async () => {
                      const ok = await goHome();
                      if (!ok) {
                        setError("Google and X need the Grok preview. Use email on this site.");
                      }
                    })
                    .catch((err: unknown) => {
                      setError(friendlyAuthError(err instanceof Error ? err.message : "Could not open sign-in."));
                    })
                    .finally(() => setBusy(null));
                }}
              >
                {busy === p.providerId ? "Opening…" : `Continue with ${p.label}`}
              </Button>
            ))
          ) : (
            <p className="type-content text-body">Sign-in is disabled in this preview.</p>
          )}
        </div>
        <p className="mt-6 type-caption uppercase tracking-wide text-marker">Or email</p>
        <form onSubmit={submit} className="mt-2 space-y-3">
          <input
            className="well mt-1 h-12 w-full rounded-full px-4 type-content outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="well h-12 w-full rounded-full px-4 type-content outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
          {error ? <p className="type-content text-danger">{error}</p> : null}
          <Button type="submit" variant="ghost" className="w-full" disabled={busy !== null}>
            {busy === "email" ? "Working…" : mode === "up" ? "Create account" : "Sign in with email"}
          </Button>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center type-chrome text-body"
            onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
          >
            {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
        <Button variant="ghost" className="mt-8 w-full" onClick={() => void nav({ to: "/" })}>
          Continue without an account
        </Button>
      </div>
    </main>
    </AppShell>
  );
}
