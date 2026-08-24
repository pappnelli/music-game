/**
 * Cute, short display labels for the raw genre tag strings stored in the catalog.
 *
 * Hungarian genres (the `hun-*` values) reuse the same short label as their non-Hungarian
 * counterpart -- GenreSelector shows them nested inside their own "Hungarian" group, so
 * repeating a "Hun" prefix on every chip there would just be noise.
 */
export const GENRE_LABELS: Record<string, string> = {
  alt: "Alt",
  country: "Country",
  edm: "EDM",
  hiphop: "Hip-Hop",
  kpop: "K-Pop",
  latin: "Latin",
  metal: "Metal",
  pop: "Pop",
  "r&b": "R&B",
  rock: "Rock",
  B: "B",

  "hun-alt": "Alt",
  "hun-folk": "Folk",
  "hun-hiphop": "Hip-Hop",
  "hun-metal": "Metal",
  "hun-pop": "Pop",
  "hun-r&b": "R&B",
  "hun-rock": "Rock",
};

/** Falls back to the raw value itself for any genre that shows up in the catalog without an
 * entry above, so a new/unmapped tag still renders instead of silently disappearing. */
export function genreLabel(genre: string): string {
  return GENRE_LABELS[genre] ?? genre;
}

const HUN_PREFIX = "hun-";

export function isHungarianGenre(genre: string): boolean {
  return genre.startsWith(HUN_PREFIX);
}
