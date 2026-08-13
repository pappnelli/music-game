import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Shared password-gate auth for /backstage (the song catalog editor) and its /api/backstage/*
 * routes. Deliberately framework-agnostic (no `next/headers`, no request/response types) so the
 * exact same functions can be called from both `proxy.ts` (which only sees `request.cookies`)
 * and route handlers -- every mutating route re-checks auth itself rather than trusting proxy
 * alone, per Next's own guidance that a matcher change can silently remove proxy coverage.
 */

export const BACKSTAGE_COOKIE_NAME = "backstage_session";
export const BACKSTAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to .env.local (and your deployment's environment variables) to enable /backstage.");
  }
  return password;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time check of a candidate password against ADMIN_PASSWORD. */
export function passwordMatches(candidate: string): boolean {
  const expected = sha256(getAdminPassword());
  const actual = sha256(candidate);
  return timingSafeEqual(expected, actual);
}

/**
 * Deterministic session token derived from the admin password itself (HMAC, not the raw
 * password) -- no separate secret to manage, and it changes automatically if the password does.
 */
export function getExpectedSessionToken(): string {
  return createHmac("sha256", getAdminPassword()).update("backstage-session").digest("hex");
}

/** Validates a session cookie value against the expected token, constant-time. */
export function sessionCookieIsValid(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  try {
    const expected = Buffer.from(getExpectedSessionToken(), "hex");
    const actual = Buffer.from(cookieValue, "hex");
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** Convenience wrapper for route handlers: re-checks auth from the request's own cookie jar
 * rather than trusting proxy.ts alone (a matcher change could silently drop proxy coverage). */
export function isRequestAuthenticated(request: NextRequest): boolean {
  return sessionCookieIsValid(request.cookies.get(BACKSTAGE_COOKIE_NAME)?.value);
}
