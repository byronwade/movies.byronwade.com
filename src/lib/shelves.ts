export const SHELF_TABS = ["favorites", "interested", "later", "watched", "passed"] as const;

export type ShelfTab = (typeof SHELF_TABS)[number];

export function parseShelf(value: unknown, fallback: ShelfTab = "later"): ShelfTab {
  return typeof value === "string" && (SHELF_TABS as readonly string[]).includes(value)
    ? (value as ShelfTab)
    : fallback;
}

export function optionalShelf(search: Record<string, unknown>): { tab?: ShelfTab } {
  if (typeof search.tab !== "string") return {};
  return { tab: parseShelf(search.tab) };
}
