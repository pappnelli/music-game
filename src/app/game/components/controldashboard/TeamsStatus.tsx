import { TeamDisc } from "@/components/Disc";
import { Card } from "@/components/ui/card";
import { Song, Team, TokenPlacement } from "@/lib/store/gameSlice";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { cn } from "@/lib/utils";
import { Active } from "@dnd-kit/core";
import { ChevronDown, Coins, DiscAlbum, Mic2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SelectedCard, SelectedToken } from "../../GameClient";
import EnlargeableSongCard from "../gameplaytimeline/EnlargeableSongCard";
import Token from "../Token";

interface TeamsStatusProps {
  teams: Team[];
  currentTeamId: string | null;
  cardPosition: number | null;
  showSolution: boolean;
  usedTokens: TokenPlacement[];
  active: Active | null;
  selectedToken: SelectedToken | null;
  selectedCard: SelectedCard | null;
  onTokenClick: (teamId: string) => void;
  onCardClick: () => void;
}

export default function TeamsStatus({
  teams,
  currentTeamId,
  cardPosition,
  showSolution,
  usedTokens,
  active,
  selectedToken,
  selectedCard,
  onTokenClick,
  onCardClick,
}: TeamsStatusProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const listFadeStyle = useEdgeFadeStyle(listRef, "y");

  if (teams.length === 0) {
    return (
      <Card className="h-full items-center justify-center gap-2 border-dashed p-6 text-center">
        <Users className="size-6 text-muted-foreground/50" />
        <p className="text-xs font-semibold text-muted-foreground">No teams in this game.</p>
      </Card>
    );
  }

  const draggingCard = active?.data.current?.type === "guessing-card";
  const guessingCardShows = cardPosition === null && !draggingCard;

  return (
    <Card className="flex h-full min-w-0 flex-col gap-2.5 p-2.5">
      <h2 className="flex shrink-0 items-center gap-2 px-1 text-xs font-black tracking-wide text-foreground uppercase">
        <Users className="size-4 text-primary" />
        Teams
      </h2>

      <div
        ref={listRef}
        style={listFadeStyle}
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 overflow-x-hidden lg:overflow-y-auto overflow-y-hidden pr-0.5 "
      >
        {teams.map((team, index) => {
          const isActive = team.id === currentTeamId;

          const hasToken = team.tokens > 0;
          const usedToken = usedTokens.some((t) => t.teamId === team.id);
          const draggingToken = active?.data.current?.teamId === team.id;
          const canUseToken = !isActive && hasToken && !usedToken && cardPosition !== null && !showSolution && !draggingToken;

          const actionSlotVisible = isActive ? !showSolution && guessingCardShows : canUseToken;

          return (
            <TeamStatusRow
              key={team.id}
              team={team}
              index={index}
              isActive={isActive}
              actionSlotVisible={actionSlotVisible}
              isTokenSelected={selectedToken?.teamId === team.id}
              isCardSelected={!!selectedCard}
              onTokenClick={onTokenClick}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>
    </Card>
  );
}

interface TeamStatusRowProps {
  team: Team;
  index: number;
  isActive: boolean;
  actionSlotVisible: boolean;
  isTokenSelected: boolean;
  isCardSelected: boolean;
  onTokenClick: (teamId: string) => void;
  onCardClick: () => void;
}

function TeamStatusRow({
  team,
  index,
  isActive,
  actionSlotVisible,
  isTokenSelected,
  isCardSelected,
  onTokenClick,
  onCardClick,
}: TeamStatusRowProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsFadeStyle = useEdgeFadeStyle(cardsRef, "x");
  const sortedCards = [...team.cards].sort((a, b) => a.year - b.year);

  // The active team's timeline is already the big drag-and-drop timeline up top, so only other
  // teams get a collapsible history strip here.
  const canExpand = !isActive && sortedCards.length > 0;

  const rowRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Collapses the strip on any click/tap outside this team's row -- opening a different team's
  // strip naturally closes this one too, since that click also lands outside this row.
  useEffect(() => {
    if (!isExpanded) return;

    function handlePointerDown(event: PointerEvent) {
      if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isExpanded]);

  return (
    <div
      ref={rowRef}
      style={{ animationDelay: `${index * 70}ms` }}
      className={cn(
        "flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-xl border-2 p-2.5 transition-all [animation:pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_backwards]",
        isActive
          ? "border-primary bg-primary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_25%)]"
          : "border-border bg-card/60",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <TeamDisc team={team} size={40} className="shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col">
          {isActive && (
            <span className="flex items-center gap-1 text-xs font-black tracking-wide text-primary uppercase">
              <Mic2 className="size-3" />
              Now playing
            </span>
          )}
          <span className={cn("truncate text-base", TEAM_NAME_CLASS)} style={teamNameGlowStyle(team.color)}>
            {team.name}
          </span>
          <span className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1 text-secondary">
              <Coins className="size-3" />
              {team.tokens}
            </span>
            {canExpand ? (
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? "Hide" : "Show"} ${team.name}'s timeline`}
                className="flex items-center gap-0.5 text-primary transition-colors hover:text-primary/70"
              >
                <DiscAlbum className="size-3" />
                {team.cards.length}
                <ChevronDown className={cn("size-3 transition-transform duration-200", isExpanded && "rotate-180")} />
              </button>
            ) : (
              <span className="flex items-center gap-1 text-primary">
                <DiscAlbum className="size-3" />
                {team.cards.length}
              </span>
            )}
          </span>
        </div>

        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center transition-opacity duration-300 sm:size-14",
            actionSlotVisible ? "opacity-100" : "invisible opacity-0",
          )}
        >
          {isActive ? (
            <Token
              team={team}
              type="guessing-card"
              compact
              onClick={actionSlotVisible ? onCardClick : undefined}
              isSelected={isCardSelected}
            />
          ) : (
            <Token
              team={team}
              type="token"
              compact
              onClick={actionSlotVisible ? () => onTokenClick(team.id) : undefined}
              isSelected={isTokenSelected}
            />
          )}
        </div>
      </div>

      {canExpand && isExpanded && (
        <div
          ref={cardsRef}
          style={cardsFadeStyle}
          className="overflow-x-auto px-1 pt-0.5 pb-2 [animation:pop-in_0.2s_ease-out_backwards]"
        >
          <div className="relative flex min-w-max items-center gap-1.5">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-full"
              style={{ background: `color-mix(in oklch, ${team.color ?? "var(--border)"}, transparent 15%)` }}
            />
            {sortedCards.map((song: Song, i) => (
              <span key={i} className="relative z-1 shrink-0">
                <EnlargeableSongCard song={song} size="small" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
