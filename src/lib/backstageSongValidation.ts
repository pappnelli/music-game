const CURRENT_YEAR = new Date().getFullYear();

export interface SongInput {
  title?: unknown;
  artist?: unknown;
  year?: unknown;
  genres?: unknown;
  album?: unknown;
  spotifyId?: unknown;
}

export interface ValidatedSong {
  title: string;
  artist: string;
  year: number;
  genres: string[];
  album: string | null;
  spotifyId: string | null;
}

/** Shared validation for the /api/backstage/songs create + update routes. Returns a typed,
 * trimmed payload alongside any human-readable problems to report back to the editor UI. */
export function validateSongInput(body: SongInput): { errors: string[]; value: ValidatedSong } {
  const errors: string[] = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) errors.push("Title is required.");

  const artist = typeof body.artist === "string" ? body.artist.trim() : "";
  if (!artist) errors.push("Artist is required.");

  const year = typeof body.year === "number" ? Math.trunc(body.year) : NaN;
  if (!Number.isFinite(year) || year < 1900 || year > CURRENT_YEAR + 1) {
    errors.push(`Year must be a number between 1900 and ${CURRENT_YEAR + 1}.`);
  }

  const genres = Array.isArray(body.genres) ? body.genres.filter((g): g is string => typeof g === "string" && g.trim().length > 0) : [];
  if (genres.length === 0) errors.push("Select at least one genre.");

  const album = typeof body.album === "string" && body.album.trim() ? body.album.trim() : null;
  const spotifyId = typeof body.spotifyId === "string" && body.spotifyId.trim() ? body.spotifyId.trim() : null;

  return { errors, value: { title, artist, year, genres, album, spotifyId } };
}
