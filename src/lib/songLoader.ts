import * as XLSX from "xlsx";
import { Song } from "./store/gameSlice";

interface RawExcelRow {
  year?: string | number;
  chart_name?: string | number;
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
      // Műfajok feldolgozása vessző mentén (pl. "pop,rock" -> ["pop", "rock"])
      let parsedGenres: string[] = ["egyéb"];
      if (row.chart_name) {
        parsedGenres = String(row.chart_name)
          .split(",")
          .map((g) => g.trim().toLowerCase()) // Egységes kisbetűs kezelés a hibák elkerülésére
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
        genres: parsedGenres.length > 0 ? parsedGenres : ["egyéb"],
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