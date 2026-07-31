"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { Frown, PartyPopper } from "lucide-react";

export default function RoundWinner() {
  const { teams, roundWinnerId } = useAppSelector((s) => s.game);
  const winner = teams.find((t) => t.id === roundWinnerId);

  return (
    <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in duration-500">
      {winner ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono text-app-white/60 uppercase tracking-widest">Round Result: Success</span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black uppercase tracking-tighter text-app-white">
              {/** TODO italic? */}
              <span
                className="relative px-1"
                style={{
                  color: winner.color,
                  textShadow: `0 0 20px ${winner.color}80`,
                }}
              >
                {winner.name}
              </span>
              <span
                className="text-app-white/70 ml-2"
                style={{
                  textShadow: `0 0 20px #ffffff80`,
                }}
              >
                wins
              </span>
            </h2>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 opacity-60">
          <span className="text-xs font-mono text-app-white/50 uppercase tracking-widest">Round Result: Null</span>
          <h2
            className="text-lg font-bold uppercase tracking-widest text-app-white/70"
            style={{
              textShadow: `0 0 20px #ffffff80`,
            }}
          >
            No winner declared
          </h2>
        </div>
      )}
    </div>
  );
}
