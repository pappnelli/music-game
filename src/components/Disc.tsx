import { CSSProperties, ReactNode } from "react";
import { getTeamInitials } from "@/lib/teamColors";
import { cn } from "@/lib/utils";

interface DiscProps {
  /** Diameter in px. */
  size: number;
  /** Whether the groove face spins. The shadow/ring never spins -- only the face does. */
  spin?: boolean;
  spinDuration?: string;
  /** The two groove tones. Defaults to the app's primary/secondary pair. */
  colorA?: string;
  colorB?: string;
  /** Full box-shadow override. Defaults to a hard press shadow tinted to colorA. */
  shadow?: string;
  /** Optional short text (e.g. team initials) shown on the record label. */
  label?: ReactNode;
  className?: string;
}

/** conic-gradient diagonal light/dark split (same 135deg language as Token) blended over the
 * groove for the "surface catches the light" cue, layered over fine alternating-tone grooves. */
function faceStyle(colorA: string, colorB: string): CSSProperties {
  return {
    backgroundImage: `conic-gradient(from 135deg, rgba(255,255,255,.4) 0deg 177deg, rgba(255,255,255,.95) 177deg 183deg, rgba(0,0,0,.22) 183deg 360deg), repeating-radial-gradient(circle at center, ${colorA} 0px, ${colorB} 2px, ${colorA} 3.5px)`,
    backgroundBlendMode: "overlay, normal",
  };
}

/** The record label: a fixed cream-white circle with a punched spindle-hole dot, regardless of
 * theme. Optionally carries a short label (team initials). */
function DiscLabel({ size, label }: { size: number; label?: ReactNode }) {
  return (
    <span
      className="absolute z-1 flex items-center justify-center rounded-full text-center leading-none font-black text-[#2a1240]"
      style={{
        inset: "32%",
        background: "radial-gradient(circle at center, color-mix(in oklch, #fdf6ff, black 8%) 0 8%, #fdf6ff 9% 100%)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,.15)",
        fontSize: Math.max(7, Math.round(size * 0.16)),
      }}
    >
      {/* {label} */}
    </span>
  );
}

/**
 * The app's one identity motif: a vinyl disc with fine concentric grooves, a diagonal light/dark
 * split painted on the surface (with a bright white seam right on the split line) instead of a
 * glow, and a record label with a spindle hole dead center.
 *
 * The outer element carries the border and the box-shadow and is never itself animated. When
 * `spin` is set, an absolutely-positioned inner face is the only thing that rotates, so the "lit
 * from above" shadow cue stays fixed while the vinyl turns underneath it -- same as a real record.
 */
export default function Disc({
  size,
  spin = false,
  spinDuration = "6s",
  colorA = "var(--primary)",
  colorB = "var(--secondary)",
  shadow,
  label,
  className,
}: DiscProps) {
  const outerStyle: CSSProperties = {
    width: size,
    height: size,
    boxShadow: shadow ?? `0 ${Math.max(2, Math.round(size / 18))}px 0 0 color-mix(in oklch, ${colorA}, black 30%)`,
  };

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-card",
        className,
      )}
      style={outerStyle}
    >
      {spin ? (
        <span
          className="absolute inset-0 rounded-full"
          style={{ ...faceStyle(colorA, colorB), animation: `spin ${spinDuration} linear infinite` }}
        />
      ) : (
        <span className="absolute inset-0 rounded-full" style={faceStyle(colorA, colorB)} />
      )}
      <DiscLabel size={size} label={label} />
    </span>
  );
}

interface TeamDiscProps {
  team: { name?: string; color?: string } | undefined;
  size: number;
  className?: string;
}

/**
 * Team identity, everywhere: the Setup team list, the Teams status panel, "who called it right",
 * Final standings and the winner card all use this same team-tinted disc -- initials on the
 * label, groove tinted to the team's own color. The diagonally-split Token is reserved for the
 * actionable pieces (the mystery card and steal token), not for identity.
 */
export function TeamDisc({ team, size, className }: TeamDiscProps) {
  const color = team?.color ?? "var(--muted-foreground)";
  return (
    <Disc
      size={size}
      colorA={color}
      colorB={`color-mix(in oklch, ${color}, black 25%)`}
      shadow={`0 ${Math.max(2, Math.round(size / 18))}px 0 0 color-mix(in oklch, ${color}, black 35%)`}
      label={getTeamInitials(team?.name)}
      className={className}
    />
  );
}
