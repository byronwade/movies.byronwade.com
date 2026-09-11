import { Component, useEffect, type ErrorInfo, type ReactNode } from "react";
import { useKino, type Notice } from "@/lib/store";
import { cn } from "@/lib/cn";

export function NoticeHost() {
  const notice = useKino((s) => s.notice);
  const clearNotice = useKino((s) => s.clearNotice);

  useEffect(() => {
    if (!notice) return;
    const ms = notice.kind === "err" ? 9000 : notice.kind === "ok" ? 5200 : 7000;
    const t = window.setTimeout(() => {
      if (useKino.getState().notice?.id === notice.id) useKino.getState().clearNotice();
    }, ms);
    return () => window.clearTimeout(t);
  }, [notice]);

  if (!notice) return null;
  return (
    <div className="notice-host" role={notice.kind === "err" ? "alert" : "status"}>
      <NoticeCard notice={notice} onDismiss={clearNotice} />
    </div>
  );
}

function NoticeCard({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  return (
    <div className={cn("notice", notice.kind === "err" && "is-err", notice.kind === "ok" && "is-ok")}>
      <div className="min-w-0 flex-1">
        <p className="type-content">{notice.title}</p>
        {notice.body ? <p className="mt-1 type-caption text-body">{notice.body}</p> : null}
      </div>
      <button type="button" className="press shrink-0 type-chrome text-accent" onClick={onDismiss}>
        OK
      </button>
    </div>
  );
}

type BoundaryState = { error: Error | null };

export class AppErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid h-full place-items-center bg-bg px-6" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="max-w-sm">
          <p className="type-page">Something broke</p>
          <p className="mt-3 type-content text-body">{this.state.error.message || "The screen did not load."}</p>
          <button
            type="button"
            className="press commit mt-6 flex h-12 w-full items-center justify-center rounded-full type-content"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
