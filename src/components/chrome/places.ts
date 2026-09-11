import { Bookmark, Clapperboard, Search, SlidersHorizontal, UserRound } from "lucide-react";

export const PLACES = [
  { to: "/", label: "For you", icon: Clapperboard },
  { to: "/tune", label: "Fine tune", icon: SlidersHorizontal },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/search", label: "Search", icon: Search },
  { to: "/profile", label: "Account", icon: UserRound },
] as const;

export type Place = (typeof PLACES)[number];
