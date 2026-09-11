import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInGate, UserButton } from "@/lib/auth/gates";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { Group, GroupRow, NativeSwitch } from "@/components/chrome/ios";
import { Button, buttonVariants } from "@/components/ui/button";
import { TasteGraph } from "@/components/taste/graph";
import { PosterGrid } from "@/components/movie/poster-grid";
import { listFavorites, listInterested, listSaved, listWatched, useKino } from "@/lib/store";
import { STREAMING_SERVICES, profileSummary, ERA_OPTIONS } from "@/tasterank";
import { connectorLoginUrl } from "@/lib/app-data/login";
import { cn } from "@/lib/cn";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserAvatar, userFullName } from "@/components/chrome/identity";
import { handleUrl, normalizeHandle } from "@/lib/handle";

export const Route = createFileRoute("/profile")({ component: Profile });

function TasteAccount() {
  return (
    <SignInGate
      fallback={
        <Link to="/login" className={cn(buttonVariants({ size: "md" }), "commit text-fg")}>
          Sign in
        </Link>
      }
    >
      <UserButton compact />
    </SignInGate>
  );
}

function AccountCard() {
  const { user } = useCurrentUserState();
  if (user) {
    return (
      <Group header="Account" className="mt-2">
        <GroupRow label={userFullName(user)} detail={user.primaryEmail ?? "Signed in"} trailing={<UserButton compact />} />
      </Group>
    );
  }
  return (
    <div className="group mt-2 px-4 py-4">
      <p className="type-section">Sign in</p>
      <p className="mt-1 type-content text-body">Keep favorites, lists, and the taste graph on this account.</p>
      <Link to="/login" className={cn(buttonVariants(), "mt-4 w-full")}>
        Sign in
      </Link>
    </div>
  );
}

function PublicPage() {
  const handle = useKino((s) => s.handle);
  const handlePublic = useKino((s) => s.handlePublic);
  const claimHandle = useKino((s) => s.claimHandle);
  const setHandlePublic = useKino((s) => s.setHandlePublic);
  const signedIn = useKino((s) => s.signedIn);
  const { user } = useCurrentUserState();
  const [draft, setDraft] = useState(handle);
  useEffect(() => {
    setDraft(handle);
  }, [handle]);
  useEffect(() => {
    if (handle || draft) return;
    const guess = normalizeHandle((user ? userFullName(user) : "") || user?.primaryEmail?.split("@")[0] || "");
    if (guess.length >= 3) setDraft(guess);
  }, [handle, draft, user]);
  const save = () => {
    if (!draft || draft === handle) return;
    void claimHandle(draft);
  };
  return (
    <>
      <Group header="Public page" className="mt-8">
        <GroupRow
          label="Anyone can view"
          trailing={<NativeSwitch checked={handlePublic} onChange={setHandlePublic} label="Anyone can view" />}
        />
      </Group>
      <div className="mt-3 flex gap-2">
        <span className="well flex h-10 min-w-0 flex-1 items-center rounded-full px-3 type-caption">
          <span className="text-marker">@</span>
          <input
            value={draft}
            onChange={(e) => setDraft(normalizeHandle(e.target.value))}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
            placeholder="byron"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent outline-none"
            aria-label="Username"
          />
        </span>
        <button type="button" className="press commit h-10 rounded-full px-4 type-chrome" onClick={save}>
          Save
        </button>
      </div>
      <p className="mt-2 px-1 type-caption text-body">
        {handle
          ? handlePublic
            ? `Live at ${handleUrl(handle)}`
            : `@${handle} is private. Only you can open it.`
          : signedIn
            ? "Pick a name. Favorites and later become a public page you can share."
            : "Sign in to claim a username."}
      </p>
      {handle ? (
        <p className="mt-3 px-1">
          <Link
            to="/u/$handle"
            params={{ handle }}
            search={{ tab: "favorites" }}
            className="press commit inline-flex h-10 items-center rounded-full px-4 type-chrome"
          >
            View my page
          </Link>
          {"  "}
          <Link to="/live" className="type-chrome text-accent">
            Service live
          </Link>
        </p>
      ) : (
        <p className="mt-2 px-1">
          <Link to="/live" className="type-chrome text-accent">
            Service live
          </Link>
        </p>
      )}
    </>
  );
}

function ProfileLists() {
  const movieState = useKino((s) => s.movieState);
  const taste = useKino((s) => s.taste);
  const handle = useKino((s) => s.handle);
  const handlePublic = useKino((s) => s.handlePublic);
  const record = useKino((s) => s.record);
  const ctx = { taste };
  const shelves = {
    favorites: { label: "Favorites", movies: listFavorites(movieState, ctx), remove: "unfavorite" as const },
    later: { label: "Later", movies: listSaved(movieState, ctx), remove: "unsave" as const },
    interested: { label: "Interested", movies: listInterested(movieState, ctx), remove: "uninterested" as const },
    watched: { label: "Watched", movies: listWatched(movieState, ctx), remove: "unseen" as const },
  };
  const filled = (Object.keys(shelves) as Array<keyof typeof shelves>).find((id) => shelves[id].movies.length);
  const [shelf, setShelf] = useState<keyof typeof shelves>(filled ?? "favorites");
  const active = shelves[shelf];
  const total = Object.values(shelves).reduce((n, s) => n + s.movies.length, 0);

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="type-section">Your lists</h2>
          <p className="mt-1 type-caption text-body">
            {handle
              ? handlePublic
                ? `These posters are public at ${handleUrl(handle)}.`
                : `@${handle} is private. Turn on Anyone can view to publish them.`
              : "Claim a username above to publish these on a public page."}
          </p>
        </div>
        {handle ? (
          <Link
            to="/u/$handle"
            params={{ handle }}
            search={{ tab: "favorites" }}
            className="shrink-0 type-chrome text-accent"
          >
            Open page
          </Link>
        ) : null}
      </div>
      <div className="-mx-1 mt-4 flex gap-1 overflow-x-auto pb-1">
        {(Object.keys(shelves) as Array<keyof typeof shelves>).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setShelf(id)}
            className={cn("press h-8 shrink-0 rounded-full px-3 type-chrome", shelf === id ? "commit" : "well")}
          >
            {shelves[id].label}
            {shelves[id].movies.length ? ` · ${shelves[id].movies.length}` : ""}
          </button>
        ))}
      </div>
      {active.movies.length ? (
        <div className="mt-4">
          <PosterGrid
            movies={active.movies}
            removeLabel="Remove"
            onRemove={(m) => record(active.remove, m.id, { label: "Removed" })}
          />
        </div>
      ) : (
        <p className="pt-6 type-content text-body">
          {total
            ? "Nothing on this shelf yet."
            : "Heart, save, or mark seen on For you. Those films land here and on your public page."}
        </p>
      )}
    </section>
  );
}

function grokLabel(state: string) {
  if (state === "connected") return "Connected";
  if (state === "checking") return "Checking…";
  if (state === "needs_login") return "Needs Grok";
  if (state === "error") return "Failed";
  if (state === "disconnected") return "Off";
  return "Not checked";
}

function Profile() {
  const { user } = useCurrentUserState();
  const taste = useKino((s) => s.taste);
  const profiles = useKino((s) => s.profiles);
  const activeProfileId = useKino((s) => s.activeProfileId);
  const setActiveProfile = useKino((s) => s.setActiveProfile);
  const renameProfile = useKino((s) => s.renameProfile);
  const pendingAsks = useKino((s) => s.pendingAsks);
  const englishOnly = useKino((s) => s.englishOnly);
  const setEnglishOnly = useKino((s) => s.setEnglishOnly);
  const spoilerSafe = useKino((s) => s.spoilerSafe);
  const setSpoilerSafe = useKino((s) => s.setSpoilerSafe);
  const tune = useKino((s) => s.tune);
  const setTune = useKino((s) => s.setTune);
  const services = useKino((s) => s.services);
  const setServices = useKino((s) => s.setServices);
  const letterboxdUser = useKino((s) => s.letterboxdUser);
  const setLetterboxdUser = useKino((s) => s.setLetterboxdUser);
  const importText = useKino((s) => s.importText);
  const importing = useKino((s) => s.importing);
  const disconnectLetterboxd = useKino((s) => s.disconnectLetterboxd);
  const gmail = useKino((s) => s.gmail);
  const scanning = useKino((s) => s.scanning);
  const checkGrok = useKino((s) => s.checkGrok);
  const scanMail = useKino((s) => s.scanMail);
  const disconnectGrok = useKino((s) => s.disconnectGrok);
  const forgetMailImports = useKino((s) => s.forgetMailImports);
  const flash = useKino((s) => s.flash);
  const [boxUser, setBoxUser] = useState(letterboxdUser);
  const [mailLogin, setMailLogin] = useState<string | undefined>();

  useEffect(() => {
    setBoxUser(letterboxdUser);
  }, [letterboxdUser]);

  const pullLetterboxd = async () => {
    const name = boxUser.trim().replace(/^@/, "");
    if (!name) {
      flash({ kind: "err", title: "Add a Letterboxd username" });
      return;
    }
    setLetterboxdUser(name);
    await importText({ username: name });
  };

  useEffect(() => {
    const retry = () => {
      try {
        if (sessionStorage.getItem("kino.mail.grok") !== "1") return;
        sessionStorage.removeItem("kino.mail.grok");
      } catch {
        return;
      }
      void (async () => {
        const grok = await checkGrok();
        if (grok.connected) await scanMail();
        else if (grok.loginRequired) setMailLogin(grok.loginUrl);
      })();
    };
    window.addEventListener("focus", retry);
    window.addEventListener("pageshow", retry);
    return () => {
      window.removeEventListener("focus", retry);
      window.removeEventListener("pageshow", retry);
    };
  }, [checkGrok, scanMail]);

  const href = connectorLoginUrl(mailLogin) ?? "https://gate.grok.me/__gate/signin";
  const grokOn = gmail.grok === "connected";
  const needsGrok =
    !grokOn && (gmail.grok === "needs_login" || gmail.grok === "unknown" || gmail.grok === "disconnected" || Boolean(mailLogin));

  const connectGrok = async () => {
    const grok = await checkGrok();
    if (grok.connected) {
      await scanMail();
      return;
    }
    try {
      sessionStorage.setItem("kino.mail.grok", "1");
    } catch {
      /* ignore */
    }
    setMailLogin(grok.loginUrl);
    window.location.assign(connectorLoginUrl(grok.loginUrl) ?? href);
  };

  return (
    <AppShell>
      <Workbench
        title={
          user ? (
            <span className="flex min-w-0 items-center gap-2">
              <UserAvatar user={user} className="size-7" />
              <span className="truncate">{userFullName(user)}</span>
            </span>
          ) : (
            "Account"
          )
        }
        trailing={<TasteAccount />}
        wide
      >
        <AccountCard />
        <p className="mt-6 type-content text-body">{profileSummary(taste)}</p>
        <p className="mt-1 type-caption text-marker">
          {taste.trainedOn} signal{taste.trainedOn === 1 ? "" : "s"} · {profiles.find((p) => p.id === activeProfileId)?.name}
        </p>

        <PublicPage />
        <ProfileLists />

        <Group header="Household" className="mt-8">
          {profiles.map((p) => (
            <GroupRow
              key={p.id}
              label={p.name}
              detail={activeProfileId === p.id ? "On" : undefined}
              onClick={() => setActiveProfile(p.id)}
            />
          ))}
        </Group>
        <p className="mt-2 px-1 type-caption text-body">
          Kids’ tickets stay off your graph. Switch profile to rank as Partner or Kids.
          {pendingAsks.length
            ? ` ${pendingAsks.length} film${pendingAsks.length === 1 ? "" : "s"} waiting on “who watched.”`
            : ""}
        </p>
        <div className="mt-3 flex gap-2">
          {profiles.map((p) => (
            <input
              key={p.id}
              aria-label={`Rename ${p.kind}`}
              defaultValue={p.name}
              onBlur={(e) => {
                const n = e.target.value.trim();
                if (n) renameProfile(p.id, n);
              }}
              className="well h-10 min-w-0 flex-1 rounded-full px-3 type-caption outline-none"
            />
          ))}
        </div>

        <Group header="Feed" className="mt-8">
          <GroupRow
            label="English only"
            trailing={<NativeSwitch checked={englishOnly} onChange={setEnglishOnly} label="English only" />}
          />
          <GroupRow
            label="Spoiler-free"
            trailing={<NativeSwitch checked={spoilerSafe} onChange={setSpoilerSafe} label="Spoiler-free" />}
          />
          <GroupRow
            label="Family-safe"
            trailing={<NativeSwitch checked={tune.familySafe} onChange={(v) => setTune({ familySafe: v })} label="Family-safe" />}
          />
          <GroupRow
            label="Under 2 hours"
            trailing={<NativeSwitch checked={tune.shortOnly} onChange={(v) => setTune({ shortOnly: v })} label="Under 2 hours" />}
          />
        </Group>
        <p className="mt-5 mb-2 px-1 type-caption uppercase tracking-wide text-marker">Age of films</p>
        <div className="flex flex-wrap gap-2">
          {ERA_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTune({ era: opt.id })}
              className={cn("press h-8 rounded-full px-3 type-chrome", tune.era === opt.id ? "commit" : "well")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 px-1 type-caption text-body">Hides the rest from For you. Search still finds everything.</p>

        <Group header="Ranking" className="mt-8">
          <GroupRow
            label="Only my services"
            trailing={
              <NativeSwitch
                checked={tune.streamingOnly}
                onChange={(v) => setTune({ streamingOnly: v })}
                label="Only my services"
              />
            }
          />
          <GroupRow
            label="Prefer newer films"
            trailing={<NativeSwitch checked={tune.preferFresh} onChange={(v) => setTune({ preferFresh: v })} label="Prefer newer films" />}
          />
          <GroupRow
            label="Weight critics more"
            trailing={<NativeSwitch checked={tune.criticsFirst} onChange={(v) => setTune({ criticsFirst: v })} label="Weight critics more" />}
          />
          <GroupRow
            label="Mix in wildcards"
            trailing={<NativeSwitch checked={tune.wildcards} onChange={(v) => setTune({ wildcards: v })} label="Mix in wildcards" />}
          />
        </Group>
        <p className="mt-2 px-1 type-caption text-body">
          Only my services needs a streaming pick below. Wildcards keep For you from repeating the same flavor.
        </p>

        <p className="mt-8 mb-2 px-1 type-caption uppercase tracking-wide text-marker">Your services</p>
        <div className="flex flex-wrap gap-2">
          {STREAMING_SERVICES.map((name) => {
            const on = services.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => setServices(on ? services.filter((s) => s !== name) : [...services, name])}
                className={cn("press h-8 rounded-full px-3 type-chrome", on ? "commit" : "well")}
              >
                {name}
              </button>
            );
          })}
        </div>

        <Group header="Letterboxd" className="mt-8">
          <GroupRow label="Public username" detail={letterboxdUser || "Not connected"} />
        </Group>
        <div className="mt-3 flex gap-2">
          <input
            value={boxUser}
            onChange={(e) => setBoxUser(e.target.value)}
            placeholder="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="well h-10 min-w-0 flex-1 rounded-full px-3 type-caption outline-none"
            aria-label="Letterboxd username"
          />
          <button type="button" className="press commit h-10 rounded-full px-4 type-chrome" disabled={importing} onClick={() => void pullLetterboxd()}>
            {importing ? "Pulling…" : "Import"}
          </button>
        </div>
        {letterboxdUser ? (
          <button type="button" className="mt-2 px-1 type-caption text-accent" onClick={() => disconnectLetterboxd()}>
            Disconnect Letterboxd
          </button>
        ) : null}

        <Group header="Grok & Gmail" className="mt-8">
          <GroupRow label="Grok" detail={grokLabel(gmail.grok)} />
          <GroupRow label="Gmail" detail={gmail.message} />
        </Group>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="press commit h-10 rounded-full px-4 type-chrome" disabled={scanning} onClick={() => void connectGrok()}>
            {scanning ? "Scanning…" : grokOn ? "Scan Gmail" : "Connect Grok"}
          </button>
          {needsGrok ? (
            <a href={href} className="press well flex h-10 items-center rounded-full px-4 type-chrome" onClick={() => {
              try {
                sessionStorage.setItem("kino.mail.grok", "1");
              } catch {
                /* ignore */
              }
            }}>
              Continue with Grok
            </a>
          ) : null}
          {grokOn ? (
            <button type="button" className="press well h-10 rounded-full px-4 type-chrome" onClick={() => disconnectGrok()}>
              Disconnect
            </button>
          ) : null}
          {gmail.total ? (
            <button type="button" className="press well h-10 rounded-full px-4 type-chrome" onClick={() => forgetMailImports()}>
              Forget Gmail films
            </button>
          ) : null}
        </div>

        <section className="mt-10">
          <h2 className="type-section">Taste graph</h2>
          <p className="mt-1 type-caption text-body">What For you is actually listening to.</p>
          <div className="group mt-4 px-4 py-4">
            <TasteGraph taste={taste} />
          </div>
          <Link to="/algorithm" className="mt-3 inline-block type-chrome text-accent">
            Ranking weights
          </Link>
        </section>
      </Workbench>
    </AppShell>
  );
}
