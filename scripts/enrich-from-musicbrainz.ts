/**
 * Enriches the song catalog using the MusicBrainz API instead of Spotify.
 *
 * Why: Spotify's Development Mode apps hit a hard daily quota wall almost
 * immediately when fetching 1500+ tracks (QUOTA_EXCEEDED, ~24h cooldown),
 * and "extended quota mode" requires being a registered company with 250k+
 * MAU — not viable here. MusicBrainz is free and has no such quota.
 *
 * Two matching strategies, tried in order:
 *  1. Release-group search (1 request): matches songs that were themselves
 *     released as a same-titled single/EP/album. Fast, but misses
 *     album-only tracks that were never issued under their own title.
 *  2. Recording search + lookup (2 requests): matches the actual recording
 *     (the song itself, independent of which release it appears on), then
 *     looks up every release containing it to find the earliest release
 *     date. Slower, but catches album tracks strategy 1 misses.
 *
 * Rate limit: MusicBrainz asks for max ~1 request/second from anonymous
 * clients with a descriptive User-Agent. This script runs strictly
 * sequentially with a delay between every HTTP call.
 *
 * Resumable: if a previous report exists, rows that already found a
 * confident match are reused. Rows still marked notFound get the recording
 * fallback (strategy 2) instead of repeating strategy 1, since a confirmed
 * zero-result release-group search won't produce different results on retry.
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

interface MBReleaseGroupSearchResult {
  id: string;
  score: number;
  title: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
  "first-release-date"?: string;
  "artist-credit"?: { name: string }[];
}

interface MBRecordingSearchResult {
  id: string;
  score: number;
  title: string;
  "artist-credit"?: { name: string }[];
}

interface MBReleaseGroupRef {
  id: string;
  title: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
}

interface MBRelease {
  id: string;
  title: string;
  date?: string;
  "release-group"?: MBReleaseGroupRef;
}

interface MBRecordingLookup {
  releases?: MBRelease[];
}

/** Unified shape both matching strategies resolve to. */
interface MatchResult {
  score: number;
  recordingTitle: string;
  artistNames: string;
  albumTitle: string;
  albumId: string;
  primaryType: string | null;
  secondaryTypes: string[];
  firstReleaseDate: string | null;
}

interface ReportRow {
  originalYear: number;
  originalArtist: string;
  originalTitle: string;
  chartGenres: string;
  spotifyUrl: string;
  matchedVia: "release-group" | "recording" | null;
  mbReleaseGroupId: string | null;
  mbScore: number | null;
  mbTitle: string | null;
  mbArtist: string | null;
  mbAlbum: string | null;
  mbPrimaryType: string | null;
  mbSecondaryTypes: string[];
  firstReleaseDate: string | null;
  firstReleaseYear: number | null;
  spellingDiff: boolean;
  yearMismatch: boolean;
  isCompilation: boolean;
  isLowConfidence: boolean;
  needsReview: boolean;
  notFound: boolean;
  isDuplicateGroup?: boolean;
}

const USER_AGENT = "MusicGameByNelli/1.0 (pappnelli7@gmail.com)";
const REQUEST_DELAY_MS = 1100; // MusicBrainz etiquette: ~1 req/sec max
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 5;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const NON_ORIGINAL_TYPES = /compilation|live|remix|mixtape/i;

const OUT_PATH = path.join(process.cwd(), "scripts", "output", "song-enrichment-report.json");

function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function escapeLucene(s: string): string {
  return s.replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, "\\$1");
}

function backoffMs(attempt: number): number {
  return Math.min(2 ** attempt * 1000, 20_000) + Math.floor(Math.random() * 300);
}

async function wait(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, attempt = 0): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });

    if (RETRYABLE_STATUSES.has(res.status)) {
      if (attempt < MAX_RETRIES) {
        const w = backoffMs(attempt);
        console.log(`  [retry] status ${res.status}, waiting ${w}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await wait(w);
        return fetchWithRetry(url, attempt + 1);
      }
      console.error(`  [give up] status ${res.status} after ${MAX_RETRIES} retries`);
      return null;
    }

    return res;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const w = backoffMs(attempt);
      console.log(`  [retry] ${(err as Error).message}, waiting ${w}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await wait(w);
      return fetchWithRetry(url, attempt + 1);
    }
    console.error(`  [give up] ${(err as Error).message} after ${MAX_RETRIES} retries`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Strategy 1: release-group search. Matches songs released as a same-titled single/EP/album. */
async function searchReleaseGroup(title: string, artist: string): Promise<MatchResult | null> {
  const query = `releasegroup:"${escapeLucene(title)}" AND artist:"${escapeLucene(artist)}"`;
  const url = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

  const res = await fetchWithRetry(url);
  if (!res || !res.ok) return null;

  const data = (await res.json()) as { "release-groups": MBReleaseGroupSearchResult[] };
  const candidates = data["release-groups"] ?? [];
  if (candidates.length === 0) return null;

  const best =
    candidates.find((c) => !(c["secondary-types"] ?? []).some((t) => NON_ORIGINAL_TYPES.test(t))) ?? candidates[0];

  return {
    score: best.score,
    recordingTitle: best.title,
    artistNames: best["artist-credit"]?.map((a) => a.name).join(", ") ?? "",
    albumTitle: best.title,
    albumId: best.id,
    primaryType: best["primary-type"] ?? null,
    secondaryTypes: best["secondary-types"] ?? [],
    firstReleaseDate: best["first-release-date"] ?? null,
  };
}

/** Strategy 2: recording search + release lookup. Catches album-only tracks strategy 1 misses. */
async function searchViaRecording(title: string, artist: string): Promise<MatchResult | null> {
  const query = `recording:"${escapeLucene(title)}" AND artist:"${escapeLucene(artist)}"`;
  const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

  const searchRes = await fetchWithRetry(searchUrl);
  if (!searchRes || !searchRes.ok) return null;

  const searchData = (await searchRes.json()) as { recordings?: MBRecordingSearchResult[] };
  const best = searchData.recordings?.[0];
  if (!best) return null;

  await wait(REQUEST_DELAY_MS);

  const lookupUrl = `https://musicbrainz.org/ws/2/recording/${best.id}?inc=releases+release-groups&fmt=json`;
  const lookupRes = await fetchWithRetry(lookupUrl);
  if (!lookupRes || !lookupRes.ok) return null;

  const lookupData = (await lookupRes.json()) as MBRecordingLookup;
  const dated = (lookupData.releases ?? []).filter((r): r is MBRelease & { date: string } => !!r.date);
  if (dated.length === 0) return null;

  const nonComp = dated.filter(
    (r) => !(r["release-group"]?.["secondary-types"] ?? []).some((t) => NON_ORIGINAL_TYPES.test(t))
  );
  const pool = nonComp.length > 0 ? nonComp : dated;
  pool.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const earliest = pool[0];
  const rg = earliest["release-group"];

  return {
    score: best.score,
    recordingTitle: best.title,
    artistNames: best["artist-credit"]?.map((a) => a.name).join(", ") ?? "",
    albumTitle: rg?.title ?? earliest.title,
    albumId: rg?.id ?? earliest.id,
    primaryType: rg?.["primary-type"] ?? null,
    secondaryTypes: rg?.["secondary-types"] ?? [],
    firstReleaseDate: earliest.date,
  };
}

function buildReportRow(
  row: RawExcelRow,
  match: MatchResult | null,
  matchedVia: "release-group" | "recording" | null
): ReportRow {
  const releaseYear = match?.firstReleaseDate ? Number(match.firstReleaseDate.slice(0, 4)) : null;
  const yearMismatch = releaseYear !== null && Math.abs(Number(row.year) - releaseYear) > 1;
  const isLowConfidence = !match || match.score < 80;
  const isCompilation = !!match && match.secondaryTypes.some((t) => NON_ORIGINAL_TYPES.test(t));

  const spellingDiff =
    !!match &&
    (normalize(match.recordingTitle) !== normalize(String(row.title)) ||
      normalize(match.artistNames) !== normalize(String(row.artist)));

  const needsReview = isLowConfidence || yearMismatch || isCompilation;

  return {
    originalYear: row.year,
    originalArtist: row.artist,
    originalTitle: row.title,
    chartGenres: row.chart_name,
    spotifyUrl: row.spotify_url,
    matchedVia,
    mbReleaseGroupId: match?.albumId ?? null,
    mbScore: match?.score ?? null,
    mbTitle: match?.recordingTitle ?? null,
    mbArtist: match?.artistNames ?? null,
    mbAlbum: match?.albumTitle ?? null,
    mbPrimaryType: match?.primaryType ?? null,
    mbSecondaryTypes: match?.secondaryTypes ?? [],
    firstReleaseDate: match?.firstReleaseDate ?? null,
    firstReleaseYear: releaseYear,
    spellingDiff,
    yearMismatch,
    isCompilation,
    isLowConfidence,
    needsReview,
    notFound: !match,
  };
}

function loadExistingReport(rows: RawExcelRow[]): (ReportRow | null)[] {
  if (!fs.existsSync(OUT_PATH)) return rows.map(() => null);

  try {
    const existing = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8")) as ReportRow[];
    if (existing.length !== rows.length) {
      console.log("Existing report has a different row count — ignoring it, doing a full run.");
      return rows.map(() => null);
    }
    const aligned = existing.every(
      (r, i) => r.originalTitle === rows[i].title && r.originalArtist === rows[i].artist
    );
    if (!aligned) {
      console.log("Existing report doesn't line up with hits.xlsx anymore — ignoring it, doing a full run.");
      return rows.map(() => null);
    }
    // Backfill mbAlbum for rows written by an older version of this script.
    for (const r of existing) {
      if (r.mbAlbum === undefined) r.mbAlbum = r.mbTitle;
      if (r.matchedVia === undefined) r.matchedVia = r.notFound ? null : "release-group";
    }
    return existing;
  } catch {
    return rows.map(() => null);
  }
}

async function main() {
  const filePath = path.join(process.cwd(), "public", "hits.xlsx");
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { raw: true });

  console.log(`Loaded ${rows.length} rows from hits.xlsx`);

  const existing = loadExistingReport(rows);
  const needsFetch = existing.map((r) => !r || r.notFound);
  const toFetchCount = needsFetch.filter(Boolean).length;
  const reused = rows.length - toFetchCount;

  if (reused > 0) {
    console.log(`Reusing ${reused} previously-successful matches.`);
    console.log(`Re-querying ${toFetchCount} still-missing rows via recording search (album tracks, not just singles).`);
  } else {
    console.log(`Trying release-group search first, falling back to recording search for ${toFetchCount} rows.`);
  }

  const startedAt = Date.now();
  const report: ReportRow[] = new Array(rows.length);
  let fetched = 0;

  for (let i = 0; i < rows.length; i++) {
    if (!needsFetch[i]) {
      report[i] = existing[i] as ReportRow;
      continue;
    }

    const row = rows[i];
    const alreadyTriedReleaseGroup = !!existing[i]; // a previous run confirmed zero release-group results
    let match: MatchResult | null = null;
    let via: "release-group" | "recording" | null = null;

    if (!alreadyTriedReleaseGroup) {
      match = await searchReleaseGroup(String(row.title), String(row.artist));
      via = match ? "release-group" : null;
      if (!match) await wait(REQUEST_DELAY_MS);
    }

    if (!match) {
      match = await searchViaRecording(String(row.title), String(row.artist));
      via = match ? "recording" : null;
    }

    report[i] = buildReportRow(row, match, via);
    fetched++;

    if (fetched % 25 === 0 || fetched === toFetchCount) {
      const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(0);
      console.log(`Fetched ${fetched}/${toFetchCount} (${elapsedSec}s elapsed)`);
    }

    if (i < rows.length - 1) await wait(REQUEST_DELAY_MS);

    if (fetched % 100 === 0) {
      fs.writeFileSync(OUT_PATH, JSON.stringify(report.map((r, idx) => r ?? existing[idx]), null, 2));
    }
  }

  const dupKeyCounts = new Map<string, number>();
  for (const row of rows) {
    const key = `${normalize(String(row.title))}|${normalize(String(row.artist))}`;
    dupKeyCounts.set(key, (dupKeyCounts.get(key) ?? 0) + 1);
  }
  for (let i = 0; i < report.length; i++) {
    const row = rows[i];
    const key = `${normalize(String(row.title))}|${normalize(String(row.artist))}`;
    report[i].isDuplicateGroup = (dupKeyCounts.get(key) ?? 0) > 1;
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  console.log("\n--- Summary ---");
  console.log(`Total rows: ${report.length}`);
  console.log(`Matched via release-group: ${report.filter((x) => x.matchedVia === "release-group").length}`);
  console.log(`Matched via recording fallback: ${report.filter((x) => x.matchedVia === "recording").length}`);
  console.log(`Not found on MusicBrainz: ${report.filter((x) => x.notFound).length}`);
  console.log(`Needs review: ${report.filter((x) => x.needsReview).length}`);
  console.log(`  - low confidence match: ${report.filter((x) => x.isLowConfidence).length}`);
  console.log(`  - year mismatch: ${report.filter((x) => x.yearMismatch).length}`);
  console.log(`  - compilation/live/remix match: ${report.filter((x) => x.isCompilation).length}`);
  console.log(`Rows in a duplicate-name group: ${report.filter((x) => x.isDuplicateGroup).length}`);
  console.log(`Report written to: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});
