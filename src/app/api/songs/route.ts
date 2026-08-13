import { and, gte, lte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs } from "@/db/schema";

/**
 * GET /api/songs
 * Optional query params: yearStart, yearEnd, genres (comma separated)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const yearStart = searchParams.get("yearStart");
  const yearEnd = searchParams.get("yearEnd");
  const genresParam = searchParams.get("genres");

  const conditions = [];
  if (yearStart) conditions.push(gte(songs.year, Number(yearStart)));
  if (yearEnd) conditions.push(lte(songs.year, Number(yearEnd)));
  if (genresParam) {
    const genreList = genresParam
      .split(",")
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean);
    if (genreList.length > 0) {
      conditions.push(sql`${songs.genres} && ${genreList}`);
    }
  }

  try {
    const rows = await db
      .select()
      .from(songs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const result = rows.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      year: row.year,
      genres: row.genres,
      spotifyId: row.spotifyId ?? undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to load songs from the database:", error);
    return NextResponse.json({ error: "Failed to load song catalog." }, { status: 500 });
  }
}
