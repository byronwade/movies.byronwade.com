import type { Movie } from "@/catalog/types";

export function runtimeLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${min}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function audienceLabel(audience: Movie["audience"]) {
  if (audience === "kids") return "Kids";
  if (audience === "family") return "Family";
  return "Adult";
}

export function watchLine(movie: Movie, subscribed: string[] = []) {
  const included = movie.watch.filter((w) => w.included);
  const yours = included.filter((w) => subscribed.includes(w.provider));
  const names = (yours.length ? yours : included).map((w) => w.provider);
  if (names.length) return `On ${names.slice(0, 2).join(" · ")}`;
  if (movie.watch.some((w) => !w.included)) return "Rent";
  return "";
}
