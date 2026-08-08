import type { CSSProperties } from "react";
import { Team } from "./store/setupSlice";

export const TEAM_COLORS = [
  "var(--team-red)",
  "var(--team-blue)",
  "var(--team-green)",
  "var(--team-yellow)",
  "var(--team-purple)",
  "var(--team-orange)",
  "var(--team-pink)",
  "var(--team-cyan)",
  "var(--team-lime)",
  "var(--team-white)",
];

export function getUniqueTeamColor(existingTeams: Team[]) {
  const usedColors = existingTeams.map((t) => t.color);
  const available = TEAM_COLORS.filter((c) => !usedColors.includes(c));

  // Ha minden szín foglalt, használj véletlent a készletből
  if (available.length === 0) {
    return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Sticker-outline text treatment for a team name: bold, upright, filled with the team's own
 * color, with a light cream text-stroke so it pops off any background like a sticker -- no
 * blurred glow. Shared across every place a team name is rendered so the look stays consistent.
 */
export function teamNameGlowStyle(color: string | undefined): CSSProperties {
  if (!color) return {};

  return {
    color,
    WebkitTextStroke: "1.2px #fdf6ff",
    paintOrder: "stroke fill",
    filter: "drop-shadow(0 1px 0 rgba(20, 10, 43, 0.3))",
  };
}

export const TEAM_NAME_CLASS = "font-black tracking-tight not-italic";

/** Up to 4 initials for a team's disc/token label, e.g. "The Vinyl Vixens" -> "TVV". */
export function getTeamInitials(name: string | undefined) {
  return (name ?? "")
    .split(" ")
    .map((word) => word.charAt(0))
    .filter((char) => char === char.toUpperCase() && char !== "")
    .join("")
    .slice(0, 4);
}
