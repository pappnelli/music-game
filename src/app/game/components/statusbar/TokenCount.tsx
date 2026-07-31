"use client";

import { Team } from "@/lib/store/gameSlice";
import Token from "../Token";

interface TokenCountProps {
  team: Team;
}

export default function TokenCount({ team }: TokenCountProps) {
  const tokens = team.tokens ?? 0;
  const hasToken = tokens > 0;

  if (!hasToken) return null;

  return (
    <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-md border border-border">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* <div 
            className="w-7 h-7 rounded-full border-4 flex items-center justify-center shadow-md relative bg-background overflow-hidden animate-pulse-slow"
            style={{ borderColor: team.color }}
          >
            <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-transparent to-accent/30 opacity-60" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          </div> */}
        <Token team={team} className="opacity-40" />
      </div>
      <span className="text-xs text-muted-foreground font-bold font-mono">×{tokens}</span>
    </div>
  );
}
