import type { ReactNode, RefObject } from "react";
import { cn } from "@/lib/cn";

export function Group({ header, children, className }: { header?: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {header ? <h2 className="mb-2 px-1 type-caption uppercase tracking-wide text-marker">{header}</h2> : null}
      <div className="group divide-y divide-fg/5">{children}</div>
    </section>
  );
}

export function GroupRow({
  label,
  detail,
  trailing,
  onClick,
}: {
  label: ReactNode;
  detail?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="min-w-0 flex-1 type-content">{label}</span>
      {detail ? <span className="type-caption text-marker">{detail}</span> : null}
      {trailing}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="press flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left">
        {inner}
      </button>
    );
  }
  return <div className="flex min-h-11 items-center gap-3 px-4 py-2">{inner}</div>;
}

export function NativeSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("ios-switch", checked ? "commit" : "well")}
    >
      <span className="ios-switch-knob" />
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  onSubmit,
  inputRef,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="well h-12 w-full rounded-full px-4 type-content outline-none placeholder:text-marker"
      />
    </form>
  );
}
