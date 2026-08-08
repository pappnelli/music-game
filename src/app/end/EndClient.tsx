"use client";

import AppBackground from "@/components/AppBackground";
import Disc from "@/components/Disc";
import ThemeToggle from "@/components/ThemeToggle";
import { useAppSelector } from "@/lib/store/hooks";
import NoSongsView from "./components/NoSongsView";
import TeamSummary from "./components/TeamSummary";
import WinnerView from "./components/WinnerView";

export default function EndClient() {
  const { winnerIds, teams } = useAppSelector((s) => s.game);

  const winningTeams = teams.filter((t) => winnerIds.includes(t.id));

  return (
    <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <AppBackground />

      <header className="flex items-center justify-between gap-3 border-b-2 border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Disc size={22} spin shadow="0 1px 0 0 color-mix(in oklch, var(--primary), black 30%)" />
          <h1 className="text-lg font-black tracking-tight text-foreground">Music Game</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:overflow-hidden">
        <div className="mx-auto flex h-full max-w-4xl flex-col gap-6 lg:overflow-hidden">
          {winningTeams.length === 0 && <NoSongsView />}
          {winningTeams.length > 0 && <WinnerView winners={winningTeams} />}

          <div className="min-h-0 flex-1 lg:overflow-y-auto">
            <TeamSummary teams={teams} />
          </div>
        </div>
      </main>
    </div>
  );
}
