import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function Workbench({
  title,
  trailing,
  children,
  wide = false,
}: {
  title?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  wide?: boolean;
}) {
  const href = useRouterState({ select: (s) => s.location.pathname + s.location.searchStr });
  const scroller = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || typeof sessionStorage === "undefined") return;
    const key = `movies:scroll:${href}`;
    const saved = Number(sessionStorage.getItem(key) || 0);
    el.scrollTop = saved;
    const persist = () => {
      sessionStorage.setItem(key, String(el.scrollTop));
    };
    el.addEventListener("scroll", persist, { passive: true });
    return () => {
      persist();
      el.removeEventListener("scroll", persist);
    };
  }, [href]);

  return (
    <div className={cn("page-shell flex h-full min-h-0 flex-col", wide && "is-wide")}>
      {title ? (
        <header
          className="flex h-12 shrink-0 items-center justify-between px-5"
          style={{ paddingTop: "var(--safe-top)", height: "calc(3rem + var(--safe-top))" }}
        >
          <h1 className="min-w-0 truncate type-section">{title}</h1>
          {trailing}
        </header>
      ) : null}
      <div ref={scroller} className="app-scroll min-h-0 flex-1 px-5 pb-8">
        {children}
      </div>
    </div>
  );
}
