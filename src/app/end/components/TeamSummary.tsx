"use client";

import SongCard from "@/app/game/components/gameplaytimeline/SongCard";
import { TeamDisc } from "@/components/Disc";
import { Card } from "@/components/ui/card";
import { Team } from "@/lib/store/gameSlice";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { Layers, ListOrdered, Medal, Zap } from "lucide-react";

interface TeamSummaryProps {
  teams: Team[];
}

export default function TeamSummary({ teams }: TeamSummaryProps) {
  const rankedTeams = [...teams].sort((a, b) => b.cards.length - a.cards.length);

  return (
    <Card className="gap-3 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-black tracking-wide text-foreground uppercase">
        <ListOrdered className="size-4 text-primary" />
        Final standings
      </h2>

      <div className="flex flex-col gap-3">
        {rankedTeams.map((team, rank) => {
          const sortedCards = [...(team.cards ?? [])].sort((a, b) => a.year - b.year);

          return (
            <div
              key={team.id}
              className={cn(
                "flex flex-col gap-2 rounded-xl border-2 p-3 transition-all [animation:pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_backwards]",
                rank !== 0 && "border-border bg-muted/30"
              )}
              style={{
                animationDelay: `${rank * 90}ms`,
                ...(rank === 0 && team.color
                  ? { borderColor: team.color, boxShadow: `0 4px 0 0 color-mix(in oklch, ${team.color}, black 25%)` }
                  : {}),
              }}
            >
              <div className="flex items-center gap-2">
                {rank === 0 && <Medal className="size-4 shrink-0 text-secondary [animation:wiggle_2s_ease-in-out_infinite]" />}
                <TeamDisc team={team} size={30} />
                <span className={cn("flex-1 truncate text-sm", TEAM_NAME_CLASS)} style={teamNameGlowStyle(team.color)}>
                  {team.name}
                </span>

                <span className="flex items-center gap-1 text-xs font-bold text-secondary">
                  <Zap className="size-3.5" />
                  {team.tokens}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-primary">
                  <Layers className="size-3.5" />
                  {team.cards.length}
                </span>
              </div>

              {sortedCards.length > 0 && (
                <div className="relative flex items-center gap-2.5 overflow-x-auto pt-6 pb-1">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full"
                    style={{
                      background: `color-mix(in oklch, ${team.color ?? "var(--border)"}, transparent 25%)`,
                      boxShadow: `0 2px 0 0 color-mix(in oklch, ${team.color ?? "var(--border)"}, black 30%)`,
                    }}
                  />
                  {sortedCards.map((song, i) => (
                    <span key={i} className="relative z-1 shrink-0">
                      <SongCard song={song} size="medium" />
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
