/**
 * Cute, short display labels for the raw genre tag strings stored in the catalog.
 *
 * Hungarian genres (the `hun-*` values) reuse the same short label as their non-Hungarian
 * counterpart -- GenreSelector shows them nested inside their own "Hungarian" group, so
 * repeating a "Hun" prefix on every chip there would just be noise.
 *
 * Keys are lowercase -- every lookup below normalizes the incoming genre string first, so this
 * still matches whatever casing/whitespace the catalog (Excel or the DB) actually has.
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
  b: "B",

  "hun-alt": "Alt",
  "hun-folk": "Folk",
  "hun-hiphop": "Hip-Hop",
  "hun-metal": "Metal",
  "hun-pop": "Pop",
  "hun-r&b": "R&B",
  "hun-rock": "Rock",
};

const HUN_PREFIX = "hun-";
const OTHER_GENRE_KEY = "b";

function normalizeGenre(genre: string): string {
  return genre.trim().toLowerCase();
}

/** Falls back to the raw value itself for any genre that shows up in the catalog without an
 * entry above, so a new/unmapped tag still renders instead of silently disappearing. */
export function genreLabel(genre: string): string {
  return GENRE_LABELS[normalizeGenre(genre)] ?? genre;
}

export function isHungarianGenre(genre: string): boolean {
  return normalizeGenre(genre).startsWith(HUN_PREFIX);
}

/** "B" is a stray data-quality flag in the catalog, not a real genre -- always shown last, after
 * the Hungarian group (see GenreSelector). */
export function isOtherGenre(genre: string): boolean {
  return normalizeGenre(genre) === OTHER_GENRE_KEY;
}

/** Rough global-popularity ordering (most to least listened-to) for the main genre roots --
 * drives the display order in GenreSelector and the setup/settings genre picker. This is a
 * judgment call, not derived from the catalog itself; adjust freely if it doesn't match. */
const GENRE_POPULARITY_ORDER = ["pop", "hiphop", "r&b", "rock", "edm", "latin", "kpop", "country", "alt", "metal"];

/** Popularity rank of a genre (Hungarian variants rank the same as their non-Hungarian
 * counterpart), lowest = most popular. Anything not in the list above ranks after everything
 * that is, so new/unmapped genres still show up instead of jumping the queue. */
export function genrePopularityRank(genre: string): number {
  const normalized = normalizeGenre(genre);
  const root = normalized.startsWith(HUN_PREFIX) ? normalized.slice(HUN_PREFIX.length) : normalized;
  const rank = GENRE_POPULARITY_ORDER.indexOf(root);
  return rank === -1 ? GENRE_POPULARITY_ORDER.length : rank;
}
