import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { PLACES } from "./places";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserAvatar, userFirstName } from "./identity";
import { useKino } from "@/lib/store";

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  return (
    <nav className="tab-bar" aria-label="Places">
      <Link to="/live" className="brand press" aria-label="movies live">
        movies
      </Link>
      <div className="tab-places">
        {PLACES.map((p) => {
          const account = p.to === "/profile";
          const to = account && !user ? "/login" : p.to;
          const on = account
            ? pathname.startsWith("/profile") || pathname.startsWith("/login")
            : p.to === "/"
              ? pathname === "/"
              : pathname.startsWith(p.to);
          const label = account ? (user ? userFirstName(user) : isPending ? "Account" : "Account") : p.label;
          return (
            <Link
              key={p.to}
              to={to}
              data-account={account ? "" : undefined}
              aria-current={on ? "page" : undefined}
              className={cn("press tab-link", on && "is-on")}
              onClick={(e) => {
                if (!on) return;
                if (p.to === "/" || p.to === "/tune") {
                  e.preventDefault();
                  useKino.getState().setIndex(0);
                }
              }}
            >
              {account && user ? (
                <UserAvatar user={user} className="size-5" />
              ) : (
                <p.icon className="size-5" strokeWidth={on ? 2 : 1.6} />
              )}
              <span className="tab-label">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="tab-user">
        <SignedOut>
          <Link to="/login" className="tab-auth press">
            Sign in
          </Link>
        </SignedOut>
        <SignedIn>
          {user ? (
            <Link to="/profile" className="tab-user-chip press" aria-label={userFirstName(user)}>
              <UserAvatar user={user} className="size-7" />
              <span className="tab-user-name">{userFirstName(user)}</span>
            </Link>
          ) : null}
        </SignedIn>
      </div>
    </nav>
  );
}
