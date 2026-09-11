import { tasteGraph } from "@/tasterank";
import type { TasteProfile } from "@/tasterank/types";
import { cn } from "@/lib/cn";

export function TasteGraph({ taste }: { taste: TasteProfile }) {
  const roots = tasteGraph(taste);
  if (!roots.length) {
    return <p className="type-content text-body">Hide a few, linger on a few, import a list. The graph fills in.</p>;
  }
  const max = Math.max(...roots.flatMap((r) => (r.children ?? [r]).map((c) => Math.abs(c.value))), 0.01);
  return (
    <div className="space-y-7">
      <p className="type-caption text-marker">
        {taste.trainedOn} signal{taste.trainedOn === 1 ? "" : "s"} in this profile
      </p>
      {roots.map((root) => (
        <div key={root.key}>
          <h3 className="mb-3 type-caption uppercase tracking-wide text-marker">{root.name}</h3>
          <ul className="space-y-2.5">
            {(root.children ?? [root]).map((n) => (
              <li key={n.key}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="type-chrome">{n.name}</span>
                  <span className="font-mono type-caption tabular-nums text-marker">{Math.round(n.value * 100)}</span>
                </div>
                <div className={cn("graph-bar", n.kind === "negative" && "neg")}>
                  <span style={{ width: `${Math.min(100, (Math.abs(n.value) / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
