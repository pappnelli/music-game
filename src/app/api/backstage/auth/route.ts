import { NextRequest, NextResponse } from "next/server";
import { BACKSTAGE_COOKIE_MAX_AGE, BACKSTAGE_COOKIE_NAME, getExpectedSessionToken, passwordMatches } from "@/lib/backstageAuth";

/**
 * POST /api/backstage/auth
 * Body: { password: string }. On success, sets the httpOnly session cookie that proxy.ts
 * (and every /api/backstage/* route) checks.
 */
export async function POST(request: NextRequest) {
  let password = "";
  try {
    const body = await request.json();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = passwordMatches(password);
  } catch {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured on the server." }, { status: 500 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(BACKSTAGE_COOKIE_NAME, getExpectedSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BACKSTAGE_COOKIE_MAX_AGE,
  });

  return response;
}

/** DELETE /api/backstage/auth — logs out by clearing the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(BACKSTAGE_COOKIE_NAME);
  return response;
}
