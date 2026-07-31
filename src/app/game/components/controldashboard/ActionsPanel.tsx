import { RootState } from "@/lib/store";
import { removeCard, removeToken, setShowSolution, Song, Team, TokenPlacement } from "@/lib/store/gameSlice";
import { cn } from "@/lib/utils";
import { Play, RotateCw, Shuffle, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Token from "../Token";

interface ActionsPanelProps {
  showSolution: boolean;
  currentSong: Song | null;
  cardPosition: number | null;
  teams: Team[];
  usedTokens: TokenPlacement[];
  currentTeamId: string | null;
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  onPlay: () => void;
  onDrawNew: () => void;
  onReveal: () => void;
  onNextRound: () => void;
  onAbort: () => void;
}

export default function ActionsPanel({
  showSolution,
  currentSong,
  cardPosition,
  teams,
  usedTokens,
  currentTeamId,
  selectedTeamId,
  setSelectedTeamId,
  onPlay,
  onDrawNew,
  onReveal,
  onNextRound,
  onAbort,
}: ActionsPanelProps) {
  const dispatch = useDispatch();

  const musicMode = useSelector((state: RootState) => state.game.musicMode);

  if (!currentSong)
    return (
      <button
        onClick={onAbort}
        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2 border border-red-500/20 transition-colors text-sm font-semibold"
      >
        <XCircle size={16} /> Játék megszakítása
      </button>
    );

  function handleReset() {
    usedTokens.map((token) => dispatch(removeToken({ teamId: token.teamId })));
    dispatch(removeCard());
    dispatch(setShowSolution(false));
  }

  const currentIdx = teams.findIndex((t) => t.id === currentTeamId);
  const rotatedTeams = currentIdx >= 0 ? [...teams.slice(currentIdx), ...teams.slice(0, currentIdx)] : teams;

  return (
    <div className="flex flex-col flex-1 h-full gap-4">
      {!showSolution ? (
        /* --- MEGOLDÁS ELŐTTI FÁZIS --- */
        <div className="flex flex-col gap-3 flex-1 justify-center">
          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={musicMode !== "spotify"}
              onClick={onPlay}
              className={cn(
                "py-3 flex items-center justify-center transition-all rounded-sm ",
                musicMode !== "spotify"
                  ? "bg-transparent border border-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-secondary/5 hover:bg-secondary/90 border border-secondary/40 text-secondary hover:text-app-black hover:shadow-[0_0_10px_var(--color-secondary)]",
              )}
            >
              <Play size={14} />
            </button>
            <button
              onClick={onDrawNew}
              className="py-3 flex items-center justify-center bg-secondary/5 border border-secondary/40 text-secondary hover:bg-secondary/90 hover:text-app-black transition-all rounded-sm hover:shadow-[0_0_10px_var(--color-secondary)]"
            >
              <Shuffle size={14} />
            </button>
            <button
              disabled={usedTokens?.length === 0}
              onClick={handleReset}
              className={cn(
                "py-3 flex items-center justify-center transition-all rounded-sm ",
                usedTokens?.length === 0
                  ? "bg-transparent border border-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-secondary/5 hover:bg-secondary/90 border border-secondary/40 text-secondary hover:text-app-black hover:shadow-[0_0_10px_var(--color-secondary)]",
              )}
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* A REVEAL a főszereplő */}
          <button
            disabled={cardPosition === null}
            onClick={onReveal}
            className={cn(
              "w-full py-4 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all rounded-sm",
              cardPosition === null
                ? "bg-transparent border border-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500 text-emerald-500 hover:text-app-black hover:shadow-[0_0_15px_rgba(16,185,129,1)]",
            )}
          >
            Reveal Solution
          </button>
        </div>
      ) : (
        /* --- MEGOLDÁS UTÁNI FÁZIS --- */
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-1 items-center justify-center">
            <span className="relative bg-card text-xs font-mono text-app-white/60 uppercase tracking-[0.3em] font-bold">
              {"// ALLOCATE_TACTICAL_CREDIT"}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3 max-h-[160px] overflow-y-auto custom-scrollbar p-2">
              {rotatedTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)}
                  className="group transition-all duration-300 hover:scale-120 active:scale-95"
                >
                  <div
                    className={cn(
                      "transition-all duration-300",
                      selectedTeamId === team.id ? "opacity-100 scale-100" : "opacity-40 hover:opacity-60",
                    )}
                  >
                    <Token team={team} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onNextRound}
            className="w-full py-4 bg-primary/10 border border-primary text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-app-black shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all rounded-sm hover:shadow-[0_0_15px_var(--color-primary)]"
          >
            Next Round
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center pt-2 border-t border-app-white/5">
        <button
          onClick={onAbort}
          className="text-xs font-mono text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors duration-200 hover:[text-shadow:0_0_10px_#ffb1b5]"
        >
          {"[ Terminate Session ]"}
        </button>
      </div>
    </div>
  );
}
