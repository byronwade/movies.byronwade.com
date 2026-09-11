export function titleKey(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^(the|a|an) /, "")
    .trim();
}

export function filmKey(title: string, year: number) {
  return `${titleKey(title)}|${year}`;
}

export function sameFilm(
  a: { title: string; year: number; director: string },
  b: { title: string; year: number; director: string },
) {
  if (titleKey(a.title) !== titleKey(b.title)) return false;
  if (Math.abs(a.year - b.year) <= 1) return true;
  if (a.director === b.director && Math.abs(a.year - b.year) <= 2) return true;
  return false;
}
