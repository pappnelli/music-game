"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { Active } from "@dnd-kit/core";
import { Layers, Zap } from "lucide-react";
import RoundWinner from "./statusbar/RoundWinner";
import Token from "./Token";

interface StatusBarProps {
  active: Active | null; // dnd-kit aktív vonszolt elem
}

export default function StatusBar({ active }: StatusBarProps) {
  const { teams, currentTeamId, showSolution, cardPosition } = useAppSelector((s) => s.game);

  const currentTeam = teams.find((t) => t.id === currentTeamId);
  const draggingCard = active?.data.current?.type === "guessing-card";
  const guessingCardShows = cardPosition === null && !draggingCard;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-border bg-card/60 px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-2">
        <Token team={currentTeam} />
        <div className="flex flex-col leading-tight">
          <span className="text-[0.6rem] font-bold tracking-wide text-muted-foreground uppercase">Now playing</span>
          <span className="text-base font-black text-foreground" style={{ color: currentTeam?.color }}>
            {currentTeam?.name ?? "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-full border-2 border-border bg-muted/40 px-3 py-1">
        <span className="flex items-center gap-1 text-xs font-bold text-secondary">
          <Zap className="size-3.5" />
          {currentTeam?.tokens ?? 0}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-primary">
          <Layers className="size-3.5" />
          {currentTeam?.cards.length ?? 0}
        </span>
      </div>

      <div className="ml-auto">
        {!showSolution ? (
          guessingCardShows && (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-bold text-muted-foreground sm:inline">Drag onto the timeline</span>
              <Token team={currentTeam} type="guessing-card" />
            </div>
          )
        ) : (
          <RoundWinner />
        )}
      </div>
    </div>
  );
}
