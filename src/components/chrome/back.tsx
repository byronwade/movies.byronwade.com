import { ChevronLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function BackButton({
  onClick,
  label = "Back",
  className,
}: {
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={cn("sheet-back press", className)}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
        else void router.navigate({ to: "/" });
      }}
    >
      <ChevronLeft className="size-5" strokeWidth={2.2} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
