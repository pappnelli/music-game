"use client";

import { useAppSelector } from "@/lib/store/hooks";
import NoSongsView from "./components/NoSongsView";
import TeamSummary from "./components/TeamSummary";
import WinnerView from "./components/WinnerView";

export default function EndClient() {
  const { winnerIds, teams } = useAppSelector((s) => s.game);

  const winningTeams = teams.filter((t) => winnerIds.includes(t.id));

  return (
    <div className="p-8 font-mono text-app-white selection:bg-primary/30 max-w-5xl mx-auto flex flex-col gap-6">
      {winningTeams.length === 0 && <NoSongsView />}
      {winningTeams.length > 0 && <WinnerView winners={winningTeams} />}

      <TeamSummary teams={teams} />
    </div>
  );
}
