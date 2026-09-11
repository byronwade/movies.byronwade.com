import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { BackButton } from "./back";

export function NativeSheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const card = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragging = useRef(false);
  const dy = useRef(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = scroller.current?.scrollTop ?? 0;
    if (scroller.current) scroller.current.scrollTop = 0;
    return () => {
      window.removeEventListener("keydown", onKey);
      if (scroller.current) scroller.current.scrollTop = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const stop = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  const resetDrag = () => {
    dragging.current = false;
    dy.current = 0;
    if (card.current) card.current.style.transform = "";
  };

  const onGrabDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    dragging.current = true;
    startY.current = e.clientY;
    dy.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onGrabMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    dy.current = Math.max(0, e.clientY - startY.current);
    if (card.current) {
      card.current.style.transition = "none";
      card.current.style.transform = `translateY(${dy.current}px)`;
    }
  };

  const onGrabUp = () => {
    if (!dragging.current) return;
    const moved = dy.current;
    dragging.current = false;
    if (card.current) {
      card.current.style.transition = "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)";
      card.current.style.transform = "";
    }
    if (moved > 48) onClose();
  };

  const node = (
    <div ref={scroller} className="sheet-scrim" onClick={onClose} onWheel={stop}>
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="sheet-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="sheet-grabber"
          aria-label="Close"
          onPointerDown={onGrabDown}
          onPointerMove={onGrabMove}
          onPointerUp={onGrabUp}
          onPointerCancel={resetDrag}
          onClick={(e) => {
            e.stopPropagation();
            if (dy.current < 8) onClose();
          }}
        />
        <header className="sheet-bar">
          <BackButton onClick={onClose} label="Close" />
          <p className="sheet-bar-title">{label}</p>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
