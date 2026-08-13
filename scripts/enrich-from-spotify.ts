/**
 * Enriches the song catalog using the Spotify Web API.
 *
 * Every row in hits.xlsx already links to a specific Spotify track, so instead of
 * guessing via search we fetch that exact track and read back its canonical
 * title/artist spelling, album name, release date, and release type.
 *
 * Note: Spotify removed the batch "Get Several Tracks" endpoint for Development
 * Mode apps in the February 2026 API changes, so this fetches tracks individually
 * (with limited concurrency) via GET /v1/tracks/{id}.
 *
 * This does NOT modify hits.xlsx or the database. It writes a report to
 * scripts/output/song-enrichment-report.json for review/further processing.
 */
import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

interface RawExcelRow {
  year: number;
  chart_name: string;
  artist: string;
  title: string;
  spotify_url: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    album_type: string;
    release_date: string;
    release_date_precision: string;
  };
}

const CONCURRENCY = 5;
const DELAY_MS = 60;

const COMPILATION_KEYWORDS =
  /greatest hits|best of|anthology|hits collection|now that|megamix|compilation|top \d+|válogatás|legjobb dalai/i;

function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function extractTrackId(url: string): string | null {
  const match = url.match(/track\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET missing from .env.local");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Failed to get Spotify token: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

const REQUEST_TIMEOUT_MS = 10_000;

async function fetchTrack(id: string, token: string, retries = 3): Promise<SpotifyTrack | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } catch (err) {
    // Timeout (AbortError) or network error — retry with backoff instead of hanging forever.
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchTrack(id, token, retries - 1);
    }
    console.error(`Gave up on track ${id} after retries:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "2");
    console.log(`Rate limited on ${id}, waiting ${retryAfter}s...`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return retries > 0 ? fetchTrack(id, token, retries - 1) : null;
  }

  if (res.status === 404) return null;

  if (!res.ok) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchTrack(id, token, retries - 1);
    }
    console.error(`Failed to fetch track ${id}: ${res.status}`);
    return null;
  }

  return (await res.json()) as SpotifyTrack;
}

/** Runs async tasks with a limited concurrency pool. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
      if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  const filePath = path.join(process.cwd(), "public", "hits.xlsx");
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { raw: true });

  console.log(`Loaded ${rows.length} rows from hits.xlsx`);

  const rowsWithTrackId = rows.map((row, index) => ({
    rowIndex: index,
    row,
    trackId: extractTrackId(String(row.spotify_url ?? "")),
  }));

  const missingTrackId = rowsWithTrackId.filter((r) => !r.trackId);
  if (missingTrackId.length > 0) {
    console.log(`Warning: ${missingTrackId.length} rows have no parseable Spotify track id.`);
  }

  const uniqueIds = Array.from(new Set(rowsWithTrackId.map((r) => r.trackId).filter((id): id is string => !!id)));
  console.log(`${uniqueIds.length} unique Spotify track ids to fetch individually (concurrency ${CONCURRENCY})`);

  const token = await getAccessToken();
  const trackMap = new Map<string, SpotifyTrack>();
  let done = 0;
  let notFound = 0;
  const startedAt = Date.now();

  await mapWithConcurrency(uniqueIds, CONCURRENCY, async (id) => {
    const track = await fetchTrack(id, token);
    if (track) {
      trackMap.set(id, track);
    } else {
      notFound++;
    }
    done++;
    if (done % 50 === 0 || done === uniqueIds.length) {
      const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(0);
      const rate = (done / ((Date.now() - startedAt) / 1000)).toFixed(1);
      console.log(`Fetched ${done}/${uniqueIds.length} (${elapsedSec}s elapsed, ~${rate}/s, ${notFound} misses so far)`);
    }
  });

  // Group original rows by normalized title+artist to find likely duplicates.
  const dupKeyCounts = new Map<string, number>();
  for (const { row } of rowsWithTrackId) {
    const key = `${normalize(String(row.title))}|${normalize(String(row.artist))}`;
    dupKeyCounts.set(key, (dupKeyCounts.get(key) ?? 0) + 1);
  }

  const report = rowsWithTrackId.map(({ row, trackId }) => {
    const track = trackId ? trackMap.get(trackId) : undefined;
    const dupKey = `${normalize(String(row.title))}|${normalize(String(row.artist))}`;
    const isDuplicateGroup = (dupKeyCounts.get(dupKey) ?? 0) > 1;

    const releaseYear = track?.album.release_date ? Number(track.album.release_date.slice(0, 4)) : null;
    const yearMismatch = releaseYear !== null && Math.abs(Number(row.year) - releaseYear) > 1;
    const isCompilation =
      !!track &&
      (track.album.album_type === "compilation" || COMPILATION_KEYWORDS.test(track.album.name));

    const spotifyArtistNames = track ? track.artists.map((a) => a.name).join(", ") : null;
    const spellingDiff =
      !!track &&
      (normalize(track.name) !== normalize(String(row.title)) ||
        normalize(spotifyArtistNames ?? "") !== normalize(String(row.artist)));

    const needsReview = !track || yearMismatch || isCompilation;

    return {
      originalYear: row.year,
      originalArtist: row.artist,
      originalTitle: row.title,
      chartGenres: row.chart_name,
      spotifyUrl: row.spotify_url,
      spotifyTrackId: trackId,
      spotifyTitle: track?.name ?? null,
      spotifyArtist: spotifyArtistNames,
      album: track?.album.name ?? null,
      albumType: track?.album.album_type ?? null,
      releaseDate: track?.album.release_date ?? null,
      releaseDatePrecision: track?.album.release_date_precision ?? null,
      spellingDiff,
      yearMismatch,
      isCompilation,
      isDuplicateGroup,
      needsReview,
      notFoundOnSpotify: !track,
    };
  });

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "song-enrichment-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  const needsReviewCount = report.filter((r) => r.needsReview).length;
  const dupCount = report.filter((r) => r.isDuplicateGroup).length;
  const notFoundCount = report.filter((r) => r.notFoundOnSpotify).length;

  console.log("\n--- Summary ---");
  console.log(`Total rows: ${report.length}`);
  console.log(`Needs review (compilation / year mismatch / not found): ${needsReviewCount}`);
  console.log(`  - not found on Spotify: ${notFoundCount}`);
  console.log(`Rows in a duplicate-name group: ${dupCount}`);
  console.log(`Report written to: ${outPath}`);
}

main().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});
