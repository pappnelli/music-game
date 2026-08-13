import { asc, like } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { isRequestAuthenticated } from "@/lib/backstageAuth";
import { SongInput, validateSongInput } from "@/lib/backstageSongValidation";

/** Mirrors the "{year}-{0001}" id convention scripts/seed.ts already uses, picking the next free
 * index for that year so manually-added songs never collide with the seeded catalog. */
async function generateSongId(year: number): Promise<string> {
  const prefix = `${year}-`;
  const existing = await db.select({ id: songs.id }).from(songs).where(like(songs.id, `${prefix}%`));

  let maxIndex = 0;
  for (const row of existing) {
    const match = row.id.match(/-(\d+)$/);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }

  return `${prefix}${String(maxIndex + 1).padStart(4, "0")}`;
}

/** GET /api/backstage/songs — the full catalog, for the editor table (filtering/searching happens
 * client-side; ~1.5k rows is small enough that a second round trip per keystroke isn't worth it). */
export async function GET(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db.select().from(songs).orderBy(asc(songs.year), asc(songs.artist));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to load songs for the editor:", error);
    return NextResponse.json({ error: "Failed to load the song catalog." }, { status: 500 });
  }
}

/** POST /api/backstage/songs — creates a new song row with a generated id. */
export async function POST(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { errors, value } = validateSongInput((body ?? {}) as SongInput);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  try {
    const id = await generateSongId(value.year);
    const [row] = await db.insert(songs).values({ id, ...value }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Failed to create song:", error);
    return NextResponse.json({ error: "Failed to create song." }, { status: 500 });
  }
}
