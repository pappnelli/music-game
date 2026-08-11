import { TeamDisc } from "@/components/Disc";
import { Card } from "@/components/ui/card";
import { Team, TokenPlacement } from "@/lib/store/gameSlice";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { Active } from "@dnd-kit/core";
import { Layers, Mic2, Users, Zap } from "lucide-react";
import SongCard from "../gameplaytimeline/SongCard";
import Token from "../Token";

interface TeamsStatusProps {
  teams: Team[];
  currentTeamId: string | null;
  cardPosition: number | null;
  showSolution: boolean;
  usedTokens: TokenPlacement[];
  active: Active | null;
}

export default function TeamsStatus({ teams, currentTeamId, cardPosition, showSolution, usedTokens, active }: TeamsStatusProps) {
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 overflow-x-hidden overflow-y-auto pr-0.5">
        {teams.map((team, index) => {
          const isActive = team.id === currentTeamId;

          const hasToken = team.tokens > 0;
          const usedToken = usedTokens.some((t) => t.teamId === team.id);
          const draggingToken = active?.data.current?.teamId === team.id;
          const canUseToken = !isActive && hasToken && !usedToken && cardPosition !== null && !showSolution && !draggingToken;
          const sortedCards = [...team.cards].sort((a, b) => a.year - b.year);

          const actionSlotVisible = isActive ? !showSolution && guessingCardShows : canUseToken;

          return (
            <div
              key={team.id}
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
                      <Zap className="size-3" />
                      {team.tokens}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <Layers className="size-3" />
                      {team.cards.length}
                    </span>
                  </span>
                </div>

                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center transition-opacity duration-300 sm:size-14",
                    actionSlotVisible ? "opacity-100" : "invisible opacity-0",
                  )}
                >
                  {isActive ? <Token team={team} type="guessing-card" compact /> : <Token team={team} type="token" compact />}
                </div>
              </div>

              {!isActive && sortedCards.length > 0 && (
                <div className="relative flex flex-wrap items-center gap-1.5 px-1 py-0.5">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-full"
                    style={{ background: `color-mix(in oklch, ${team.color ?? "var(--border)"}, transparent 15%)` }}
                  />
                  {sortedCards.map((song, i) => (
                    <span key={i} className="relative z-1">
                      <SongCard song={song} size="small" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
