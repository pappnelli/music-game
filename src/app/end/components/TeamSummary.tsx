"use client";

import SongCard from "@/app/game/components/gameplaytimeline/SongCard";
import { TeamDisc } from "@/components/Disc";
import { Card } from "@/components/ui/card";
import { Song, Team } from "@/lib/store/gameSlice";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { cn } from "@/lib/utils";
import { Coins, DiscAlbum, ListOrdered, Medal } from "lucide-react";
import { useRef } from "react";

interface TeamSummaryProps {
  teams: Team[];
}

export default function TeamSummary({ teams }: TeamSummaryProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const listFadeStyle = useEdgeFadeStyle(listRef, "y");
  const rankedTeams = [...teams].sort((a, b) => b.cards.length - a.cards.length);

  return (
    <Card className="gap-3 p-4 sm:p-5 lg:h-full lg:min-h-0">
      <h2 className="flex shrink-0 items-center gap-2 text-sm font-black tracking-wide text-foreground uppercase">
        <ListOrdered className="size-4 text-primary" />
        Final standings
      </h2>

      <div ref={listRef} style={listFadeStyle} className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {rankedTeams.map((team, rank) => (
          <TeamStandingRow key={team.id} team={team} rank={rank} />
        ))}
      </div>
    </Card>
  );
}

interface TeamStandingRowProps {
  team: Team;
  rank: number;
}

function TeamStandingRow({ team, rank }: TeamStandingRowProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsFadeStyle = useEdgeFadeStyle(cardsRef, "x");
  const sortedCards = [...(team.cards ?? [])].sort((a, b) => a.year - b.year);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border-2 p-3 transition-all [animation:pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_backwards]",
        rank !== 0 && "border-border bg-muted/30",
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
          <Coins className="size-3.5" />
          {team.tokens}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-primary">
          <DiscAlbum className="size-3.5" />
          {team.cards.length}
        </span>
      </div>

      {sortedCards.length > 0 && (
        <div ref={cardsRef} style={cardsFadeStyle} className="overflow-x-auto pt-6 pb-2.5">
          <div className="relative flex min-w-max items-center gap-2.5">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full"
              style={{
                background: `color-mix(in oklch, ${team.color ?? "var(--border)"}, transparent 25%)`,
                boxShadow: `0 2px 0 0 color-mix(in oklch, ${team.color ?? "var(--border)"}, black 30%)`,
              }}
            />
            {sortedCards.map((song: Song, i) => (
              <span key={i} className="relative z-1 shrink-0">
                <SongCard song={song} size="medium" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
