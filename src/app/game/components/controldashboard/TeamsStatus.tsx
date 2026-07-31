import { Team, TokenPlacement } from "@/lib/store/gameSlice";
import Token from "../Token";
import { cn } from "@/lib/utils";
import { Active } from "@dnd-kit/core";
import SongCard from "../gameplaytimeline/SongCard";

interface TeamsStatusProps {
  teams: Team[];
  currentTeamId: string | null;
  cardPosition: number | null;
  showSolution: boolean;
  usedTokens: TokenPlacement[];
  active: Active | null;
}

export default function TeamsStatus({ teams, currentTeamId, cardPosition, showSolution, usedTokens, active }: TeamsStatusProps) {
  return (
    <div className="flex flex-col gap-3">
      {teams.map((team) => {
        if (team.id === currentTeamId) return null;

        const hasToken = team.tokens > 0;
        const usedToken = usedTokens.some((t) => t.teamId === team.id);
        const draggingToken = active?.data.current?.teamId === team.id;
        const canUseToken = hasToken && !usedToken && cardPosition !== null && !showSolution && !draggingToken;
        const sortedCards = [...team.cards].sort((a, b) => a.year - b.year);

        return (
          <div key={team.id} className="w-full flex gap-2">
            <div
              className="px-2 py-0.5 h-min m-auto rounded text-xs uppercase font-mono border"
              style={{
                borderColor: team.color,
                color: team.color,
                backgroundColor: `${team.color}10`,
              }}
            >
              {team.name}
            </div>
            {/* CSAPAT PANEL */}
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex items-center gap-6 justify-center">
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

              {/* IDŐVONAL PANEL */}
              <div className="flex flex-row justify-center w-full flex-nowrap overflow-visible gap-2">
                {sortedCards.map((song, i) => (
                  <SongCard key={i} song={song} size="small" />
                ))}
              </div>
            </div>

            <div className={cn("h-full m-auto transition-all duration-300", canUseToken ? "" : "opacity-0 pointer-events-none")}>
              <Token team={team} type="token" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
