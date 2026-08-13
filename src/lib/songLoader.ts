import * as XLSX from "xlsx";
import { Song } from "./store/gameSlice";

interface RawExcelRow {
  year?: string | number;
  genres?: string | number;
  artist?: string | number;
  title?: string | number;
  spotify_url?: string | number;
}

function parseExcelRows(rawRows: RawExcelRow[]): Song[] {
  return rawRows
    .filter(
      (row): row is RawExcelRow & { year: unknown; artist: unknown; title: unknown } =>
        row.year !== undefined && row.artist !== undefined && row.title !== undefined
    )
    .map((row, index) => {
      // Műfajok feldolgozása vessző mentén (pl. "Pop,Rock" -> ["Pop", "Rock"]).
      // Display casing intact — mirrors scripts/seed.ts so custom decks match
      // the same genre strings the DB-backed catalog uses.
      let parsedGenres: string[] = ["Pop"];
      if (row.genres) {
        parsedGenres = String(row.genres)
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.length > 0);
      }

      // Egyedi ID generálása az évszámból és az indexből
      const currentYear = Number(row.year);
      const generatedId = `${currentYear}-${String(index + 1).padStart(4, "0")}`;

      return {
        id: generatedId,
        title: String(row.title).trim(),
        artist: String(row.artist).trim(),
        year: currentYear,
        genres: parsedGenres.length > 0 ? parsedGenres : ["Pop"],
        spotifyId: row.spotify_url ? String(row.spotify_url).trim() : undefined,
      };
    });
}

/**
 * Betölti a dalokat a játék számára.
 * - Paraméter nélkül: a szerver oldali adatbázisból kéri le a katalógust (/api/songs).
 * - File paraméterrel: egyedi, kliens oldalon feltöltött Excel deck-et dolgoz fel.
 */
export async function loadSongs(file?: File): Promise<Song[]> {
  try {
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { raw: true });
      return parseExcelRows(rawRows);
    }

    const response = await fetch("/api/songs");
    if (!response.ok) {
      throw new Error("Nem sikerült betölteni a daltárat az adatbázisból.");
    }
    return (await response.json()) as Song[];
  } catch (error) {
    console.error("Hiba történt a dalok beolvasása közben:", error);
    throw error;
  }
}