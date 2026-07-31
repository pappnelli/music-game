"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { Active } from "@dnd-kit/core";
import RoundWinner from "./statusbar/RoundWinner";
import Token from "./Token";
import TeamsStatus from "./controldashboard/TeamsStatus";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  active: Active | null; // dnd-kit aktív vonszolt elem
}

export default function StatusBar({ active }: StatusBarProps) {
  const { teams, currentTeamId, showSolution, cardPosition, tokens } = useAppSelector((s) => s.game);

  const currentTeam = teams.find((t) => t.id === currentTeamId);
  const draggingCard = active?.data.current?.type === "guessing-card";
  const guessingCardShows = cardPosition === null && !draggingCard;

  return (
    <div className="w-full bg-card border border-border p-4 rounded-xl shadow-[var(--shadow-glow)] items-center justify-between gap-6">
      <div className="w-full flex gap-4">
        {/* CSAPAT PANEL - Ugyanaz a stílus mint a menü kártyád */}
        <div className="flex flex-1 items-center gap-6 border-r border-border/50 pr-6">
          <div className="flex items-center gap-3">
            <div
              className="px-2 py-0.5 h-min m-auto rounded text-md uppercase font-mono border"
              style={{
                borderColor: currentTeam?.color,
                color: currentTeam?.color,
                backgroundColor: `${currentTeam?.color}10`,
              }}
            >
              {currentTeam?.name}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex gap-1 items-center">
              <span className="text-xs font-mono text-primary/70 uppercase tracking-widest">Credits:</span>
              <span className="text-sm font-mono font-bold text-app-white">{currentTeam?.tokens ?? 0}</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-xs font-mono text-secondary/70 uppercase tracking-widest">Cards:</span>
              <span className="text-sm font-mono font-bold text-app-white">{currentTeam?.cards.length ?? 0}</span>
            </div>
          </div>
        </div>

        {/* AKCIÓ PANEL - Kártyás elrendezésben */}
        {!showSolution ? (
          <div className="flex items-center justify-end gap-6">
            <div className={cn("flex flex-col items-end transition-all duration-300", guessingCardShows ? "" : "opacity-0")}>
              <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">System Input Required</span>
              <span className="text-sm font-bold text-app-white uppercase">Awaiting Action</span>
            </div>

            <div className="w-12 h-12">{guessingCardShows && <Token team={currentTeam} type="guessing-card" />}</div>
          </div>
        ) : (
          <RoundWinner />
        )}
      </div>
    </div>
  );
}
