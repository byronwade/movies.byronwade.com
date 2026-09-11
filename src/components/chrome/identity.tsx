import { cn } from "@/lib/cn";
import type { AppUser } from "@/lib/auth/use-current-user";

export function userFirstName(user: AppUser) {
  const n = user.displayName?.trim();
  if (n) return n.split(/\s+/)[0]!;
  const email = user.primaryEmail?.trim();
  if (email) return email.split("@")[0]!;
  return "You";
}

export function userFullName(user: AppUser) {
  return user.displayName?.trim() || user.primaryEmail?.split("@")[0] || "You";
}

export function UserAvatar({ user, className }: { user: AppUser; className?: string }) {
  const label = userFullName(user);
  if (user.profileImageUrl) {
    return <img src={user.profileImageUrl} alt="" className={cn("rounded-full object-cover", className)} />;
  }
  return (
    <span className={cn("grid place-items-center rounded-full bg-elevated type-caption text-fg", className)} aria-hidden>
      {label.charAt(0).toUpperCase()}
    </span>
  );
}
