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
