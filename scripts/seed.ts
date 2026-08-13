import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { db } from "../src/db";
import { songs, type NewSongRow } from "../src/db/schema";

interface RawExcelRow {
  year?: string | number;
  genres?: string | number;
  artist?: string | number;
  title?: string | number;
  album?: string | number;
  spotify_url?: string | number;
}

const BATCH_SIZE = 500;
const SOURCE_FILE = "hits-clean.xlsx";

function parseRows(rawRows: RawExcelRow[]): NewSongRow[] {
  return rawRows
    .filter(
      (row): row is RawExcelRow & { year: unknown; artist: unknown; title: unknown } =>
        row.year !== undefined && row.artist !== undefined && row.title !== undefined
    )
    .map((row, index) => {
      // Genre labels (Pop, HipHop, R&B, KPop, ...) are stored with their
      // display casing intact — no lowercasing, so the UI can render them
      // directly without a separate display-name lookup.
      let genres = ["Pop"];
      if (row.genres) {
        const parsed = String(row.genres)
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.length > 0);
        if (parsed.length > 0) genres = parsed;
      }

      const year = Number(row.year);
      return {
        id: `${year}-${String(index + 1).padStart(4, "0")}`,
        title: String(row.title).trim(),
        artist: String(row.artist).trim(),
        year,
        genres,
        album: row.album ? String(row.album).trim() : null,
        spotifyId: row.spotify_url ? String(row.spotify_url).trim() : null,
      };
    });
}

async function seed() {
  const filePath = path.join(process.cwd(), "public", SOURCE_FILE);
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { raw: true });

  const rows = parseRows(rawRows);
  if (rows.length === 0) {
    console.log(`No valid rows found in ${SOURCE_FILE} — nothing to seed.`);
    return;
  }

  // Full replace rather than upsert-by-id: row order/count can change between
  // cleanups (dedup, corrections), so position-derived ids aren't stable
  // across runs. IDs are regenerated client-side on load anyway (see
  // SetupClient.tsx), so a clean wipe-and-reinsert is simpler and safer than
  // reconciling stale rows.
  await db.delete(songs);
  console.log("Cleared existing songs table.");

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(songs).values(batch);
    inserted += batch.length;
    console.log(`Seeded ${inserted}/${rows.length}`);
  }

  console.log(`Done. Seeded ${rows.length} songs from ${SOURCE_FILE}.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
