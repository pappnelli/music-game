"use client";

import SongCard from "@/app/game/components/gameplaytimeline/SongCard";
import { Team } from "@/lib/store/gameSlice";

interface TeamSummaryProps {
  teams: Team[];
}

export default function TeamSummary({ teams }: TeamSummaryProps) {
  return (
    <div className="w-full rounded-lg border border-app-white/10 bg-card p-6 backdrop-blur-sm shadow-[var(--shadow-glow)]">
      <div className="flex justify-between items-center border-b border-app-white/10 pb-6 mb-6">
        <h2 className="text-xl font-black uppercase tracking-widest text-app-white/90">Final Standings</h2>
        <span className="text-xs uppercase tracking-widest text-app-white/70">{teams.length} Teams Active</span>
      </div>

      <div className="flex flex-col gap-6">
        {teams.map((team) => {
          const sortedCards = [...(team.cards ?? [])].sort((a, b) => a.year - b.year);

          return (
            <div key={team.id} className="w-full flex gap-2">
              {/* CSAPAT PANEL */}
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex gap-4">
                  <div
                    className="px-2 py-0.5 h-min rounded text-xs uppercase font-mono border"
                    style={{
                      borderColor: team.color,
                      color: team.color,
                      backgroundColor: `${team.color}10`,
                    }}
                  >
                    {team.name}
                  </div>
                  <div className="flex items-center gap-6 border-r border-border/50 pr-4">
                    <div className="flex gap-6">
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-mono text-primary/70 uppercase tracking-widest">Credits</span>
                        <span className="text-xs font-mono font-bold text-app-white/90">{team.tokens}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-mono text-secondary/70 uppercase tracking-widest">Cards</span>
                        <span className="text-xs font-mono font-bold text-app-white/90">{team.cards.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IDŐVONAL PANEL */}
                <div className="flex flex-row justify-center w-full flex-nowrap overflow-visible gap-2">
                  {sortedCards.map((song, i) => (
                    <SongCard key={i} song={song} size="medium" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
