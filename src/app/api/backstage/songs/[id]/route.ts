import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { isRequestAuthenticated } from "@/lib/backstageAuth";
import { SongInput, validateSongInput } from "@/lib/backstageSongValidation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** PATCH /api/backstage/songs/[id] — full replace of the editable fields (the editor form always
 * sends the whole record, so partial-merge semantics aren't needed here). */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
    const [row] = await db.update(songs).set(value).where(eq(songs.id, id)).returning();
    if (!row) {
      return NextResponse.json({ error: "Song not found." }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error(`Failed to update song ${id}:`, error);
    return NextResponse.json({ error: "Failed to update song." }, { status: 500 });
  }
}

/** DELETE /api/backstage/songs/[id] */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [row] = await db.delete(songs).where(eq(songs.id, id)).returning();
    if (!row) {
      return NextResponse.json({ error: "Song not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`Failed to delete song ${id}:`, error);
    return NextResponse.json({ error: "Failed to delete song." }, { status: 500 });
  }
}
