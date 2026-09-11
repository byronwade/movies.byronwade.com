import { useEffect } from "react";
import { useKino } from "@/lib/store";

export function UndoToast() {
  const undo = useKino((s) => s.undo);
  const undoLast = useKino((s) => s.undoLast);

  useEffect(() => {
    if (!undo) return;
    const id = undo.eventId;
    const t = window.setTimeout(() => {
      if (useKino.getState().undo?.eventId === id) useKino.setState({ undo: null });
    }, 4200);
    return () => window.clearTimeout(t);
  }, [undo]);

  if (!undo) return null;
  return (
    <div className="undo-host" role="status">
      <div className="undo-toast">
        <span className="type-content text-body">{undo.label}</span>
        <button type="button" className="ml-auto min-h-11 type-chrome" onClick={undoLast}>
          Undo
        </button>
      </div>
    </div>
  );
}
