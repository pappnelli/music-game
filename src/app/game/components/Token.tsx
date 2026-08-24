import { Team } from "@/lib/store/gameSlice";
import { Team as setupTeam } from "@/lib/store/setupSlice";
import { getTeamInitials } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CircleHelp, Zap } from "lucide-react";
import { useRef } from "react";

/** Below this many px of pointer movement between down and up, a gesture counts as a click
 * rather than a drag. Real clicks routinely drift a few px (trackpad, touch, an imprecise
 * mouse) -- dnd-kit's own sensor can briefly activate-and-revert a "drag" for that same
 * movement and, once activated, explicitly swallows the resulting native click event. Deciding
 * "was this a click" ourselves from raw pointer coordinates sidesteps that entirely instead of
 * depending on the native click event surviving. */
const CLICK_DISTANCE_THRESHOLD = 8;

interface TokenProps {
  team: Team | setupTeam | undefined;
  className?: string | null;
  type?: string | null;
  size?: "sm" | "default" | "lg";
  /** Shrinks the draggable guessing-card / steal-token variants for tight list contexts (e.g. the teams list). */
  compact?: boolean;
  /** Click-to-place alternative to dragging -- arms/disarms this token or card. */
  onClick?: () => void;
  /** Visually "armed" and waiting for a slot click. */
  isSelected?: boolean;
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

export default function Token({ team, className, type, size = "default", compact = true, onClick, isSelected = false }: TokenProps) {
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

  const pointerDownAt = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    listeners?.onPointerDown?.(event);
    pointerDownAt.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>, clickHandler?: () => void) {
    const start = pointerDownAt.current;
    pointerDownAt.current = null;
    if (!clickHandler || !start) return;

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (distance < CLICK_DISTANCE_THRESHOLD) clickHandler();
  }

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
          className,
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
    // Click-to-place is an alternative to dragging for both the mystery card and steal tokens.
    const isClickable = (isStealToken || isGuessingCard) && !!onClick;

    // "Picked up" -- either an actual drag in progress, or armed for click-to-place (the floating
    // ghost/cursor copy is the "real" one right now). The spot it came from reads as emptied out
    // rather than staying fully solid in two places at once.
    const isHollow = isDragging || isSelected;

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        data-token-ui=""
        onPointerDown={handlePointerDown}
        onPointerUp={(event) => handlePointerUp(event, isClickable ? onClick : undefined)}
        onClick={(event) => {
          // The actual click-to-place logic already ran from onPointerUp above -- this only
          // stops a stray native click bubbling up to an ancestor (e.g. the timeline slot this
          // token sits in), which would otherwise be misread as a slot click.
          if (isClickable) event.stopPropagation();
        }}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        aria-pressed={isClickable ? isSelected : undefined}
        style={
          {
            ...style,
            background: isHollow ? "transparent" : tokenSplit(color),
            borderColor: isHollow ? color : undefined,
            boxShadow: isHollow ? "none" : "0 0 0 2px var(--card), 0 5px 0 0 rgba(20,10,43,0.35)",
          } as React.CSSProperties
        }
        className={cn(
          "group/token relative flex shrink-0 cursor-grab touch-none flex-col items-center justify-center rounded-2xl border-2 border-white/40 text-white transition-all active:cursor-grabbing active:shadow-none active:translate-y-1.5",
          compact ? "size-12 sm:size-14" : "size-16 sm:size-18",
          !isHollow && "[animation:token-float_3s_ease-in-out_infinite]",
          isDragging && "z-10 scale-105 rotate-3",
          isSelected && "z-20 scale-105",
          isHollow && "border-dashed opacity-60 animate-pulse",
          className,
        )}
        title={teamName}
      >
        <span
          className={cn(
            "relative text-xs font-black tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
            isHollow && "opacity-50",
          )}
        >
          {initials}
        </span>

        <span
          aria-hidden
          className={cn(
            "absolute flex items-center justify-center rounded-full border-2 border-white/70 text-white shadow",
            isGuessingCard ? "bg-accent" : "bg-secondary",
            compact ? "-top-1 -right-1 size-4" : "-top-1.5 -right-1.5 size-5",
            isHollow ? "opacity-50" : "[animation:wiggle_1.4s_ease-in-out_infinite]",
          )}
        >
          <AccentIcon className={cn(compact ? "size-2.5" : "size-3", isStealToken && "fill-current")} strokeWidth={2.5} />
        </span>
      </div>
    );
  }

  return null;
}

interface TokenGhostProps {
  team: Team | setupTeam | undefined;
  type: "token" | "guessing-card";
  compact?: boolean;
}

/** Non-interactive visual copy of a token/card, used as the floating "held under the cursor"
 * preview during click-to-place -- the two-click alternative to actually dragging. Deliberately
 * skips useDraggable entirely (it's a picture, not a drop target or a second draggable source
 * fighting the real one over the same id) and skips all the click/pointer wiring above. */
export function TokenGhost({ team, type, compact = true }: TokenGhostProps) {
  const { color, name: teamName } = team ?? {};
  const isGuessingCard = type === "guessing-card";
  const AccentIcon = isGuessingCard ? CircleHelp : Zap;
  const initials = getTeamInitials(teamName) || "?";

  return (
    <div
      style={
        {
          background: tokenSplit(color),
          boxShadow: "0 0 0 2px var(--card), 0 5px 0 0 rgba(20,10,43,0.35)",
        } as React.CSSProperties
      }
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-white/40 text-white",
        compact ? "size-12 sm:size-14" : "size-16 sm:size-18",
      )}
    >
      <span className="relative text-xs font-black tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{initials}</span>

      <span
        aria-hidden
        className={cn(
          "absolute flex items-center justify-center rounded-full border-2 border-white/70 text-white shadow",
          isGuessingCard ? "bg-accent" : "bg-secondary",
          compact ? "-top-1 -right-1 size-4" : "-top-1.5 -right-1.5 size-5",
        )}
      >
        <AccentIcon className={cn(compact ? "size-2.5" : "size-3", !isGuessingCard && "fill-current")} strokeWidth={2.5} />
      </span>
    </div>
  );
}
