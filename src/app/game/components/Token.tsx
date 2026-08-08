import { Team } from "@/lib/store/gameSlice";
import { Team as setupTeam } from "@/lib/store/setupSlice";
import { getTeamInitials } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CircleHelp, Zap } from "lucide-react";

interface TokenProps {
  team: Team | setupTeam | undefined;
  className?: string | null;
  type?: string | null;
  size?: "sm" | "default" | "lg";
  /** Shrinks the draggable guessing-card / steal-token variants for tight list contexts (e.g. the teams list). */
  compact?: boolean;
}

const BADGE_SIZES = {
  sm: "size-7 text-xs",
  default: "size-10 text-xs",
  lg: "size-16 text-lg",
} as const;

/** The diagonally-split team-colored surface shared by every token variant -- light half / dark
 * half of the team's own color, split corner to corner, same 135deg language as the disc's highlight. */
function tokenSplit(color: string | undefined) {
  return `conic-gradient(from 135deg, color-mix(in oklch, ${color}, white 35%) 0deg 180deg, color-mix(in oklch, ${color}, black 25%) 180deg 360deg)`;
}

export default function Token({ team, className, type, size = "default", compact = false }: TokenProps) {
  const { color, id: teamId, name: teamName } = team ?? {};

  const isGuessingCard = type === "guessing-card" || type === "timeline-guessing-card";
  const isStealToken = type === "token" || type === "timeline-token";
  const draggableId = `${type ?? ""}-${teamId}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: {
      title: type ?? "",
      type: isGuessingCard ? "guessing-card" : "token",
      teamId,
    },
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const initials = getTeamInitials(teamName) || "?";

  // Static, non-draggable team badge -- a diagonally-split disc in the team's color
  if (!type) {
    return (
      <div
        className={cn(
          "group/badge relative flex shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 ease-out hover:scale-110",
          BADGE_SIZES[size],
          className
        )}
        style={
          {
            background: tokenSplit(color),
            boxShadow: `0 0 0 2px var(--card), 0 3px 0 0 color-mix(in oklch, ${color}, black 35%)`,
          } as React.CSSProperties
        }
        title={teamName}
      >
        <span className="font-black tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{initials}</span>
      </div>
    );
  }

  // Draggable "mystery track" card and draggable "steal" token -- one shared design language
  // (shape, size, diagonal split, float) so the pair reads as a matched set. The only
  // difference is the corner badge: a question mark for the mystery card, a bolt for the steal token.
  if (isGuessingCard || isStealToken) {
    const AccentIcon = isGuessingCard ? CircleHelp : Zap;

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={
          {
            ...style,
            background: tokenSplit(color),
            boxShadow: "0 0 0 2px var(--card), 0 5px 0 0 rgba(20,10,43,0.35)",
          } as React.CSSProperties
        }
        className={cn(
          "group/token relative flex shrink-0 cursor-grab touch-none flex-col items-center justify-center rounded-2xl border-2 border-white/40 text-white transition-transform active:cursor-grabbing active:shadow-none active:translate-y-1.5",
          compact ? "size-12 sm:size-14" : "size-16 sm:size-18",
          !isDragging && "[animation:token-float_3s_ease-in-out_infinite]",
          isDragging && "z-10 scale-105 rotate-3 opacity-90",
          className
        )}
        title={teamName}
      >
        <span className="relative text-xs font-black tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{initials}</span>

        <span
          aria-hidden
          className={cn(
            "absolute flex items-center justify-center rounded-full border-2 border-white/70 text-white shadow [animation:wiggle_1.4s_ease-in-out_infinite]",
            isGuessingCard ? "bg-accent" : "bg-secondary",
            compact ? "-top-1 -right-1 size-4" : "-top-1.5 -right-1.5 size-5"
          )}
        >
          <AccentIcon className={cn(compact ? "size-2.5" : "size-3", isStealToken && "fill-current")} strokeWidth={2.5} />
        </span>
      </div>
    );
  }

  return null;
}
