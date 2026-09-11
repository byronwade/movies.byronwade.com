import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/chrome/shell";
import { Workbench } from "@/components/chrome/workbench";
import { TasteGraph } from "@/components/taste/graph";
import { useKino } from "@/lib/store";
import { RANK_WEIGHTS } from "@/tasterank";

export const Route = createFileRoute("/algorithm")({ component: Algorithm });

function Algorithm() {
  const taste = useKino((s) => s.taste);
  return (
    <AppShell>
      <Workbench title="Evidence">
        <Link to="/profile" className="type-caption text-accent">
          Account
        </Link>
        <p className="mt-4 type-content text-body">
          For you is the algorithm. Genre, mood, and who are sitting filters. Fine Tune teaches it. Grok reorders the next twenty once you have enough marks.
        </p>
        <div className="group mt-6 px-4 py-4">
          <TasteGraph taste={taste} />
        </div>
        <h2 className="mt-10 mb-3 px-1 type-caption uppercase tracking-wide text-marker">Weights</h2>
        <ul className="group divide-y divide-fg/5">
          {RANK_WEIGHTS.map((w) => (
            <li key={w.key} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="type-content">{w.label}</p>
                <p className="mt-0.5 type-caption text-body">{w.detail}</p>
              </div>
              <p className="shrink-0 font-mono type-caption tabular-nums text-accent">{w.pct}</p>
            </li>
          ))}
        </ul>
      </Workbench>
    </AppShell>
  );
}
