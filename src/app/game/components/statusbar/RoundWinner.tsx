"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { PartyPopper, Sparkles, Trophy } from "lucide-react";

export default function RoundWinner() {
  const { teams, roundWinnerId } = useAppSelector((s) => s.game);
  const winner = teams.find((t) => t.id === roundWinnerId);

  if (!winner) {
    return (
      <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground">
        <Trophy className="size-4" />
        No one called it right this round
      </div>
    );
  }

  return (
    <div
      className="relative flex w-full flex-col items-center gap-1.5 overflow-hidden rounded-2xl border-2 px-4 py-3 text-center shadow-[0_5px_0_0_rgba(20,10,43,0.35)] [animation:pop-in_0.45s_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        borderColor: winner.color,
        background: `linear-gradient(150deg, color-mix(in oklch, ${winner.color}, white 25%), color-mix(in oklch, ${winner.color}, black 10%))`,
        boxShadow: `0 5px 0 0 color-mix(in oklch, ${winner.color}, black 35%)`,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.5),transparent_55%)]" />
      <Sparkles aria-hidden className="absolute top-2 left-3 size-3.5 text-white/80 [animation:pop-in_1.8s_ease-in-out_infinite]" />
      <Sparkles aria-hidden className="absolute right-3 bottom-2 size-3 text-white/80 [animation:pop-in_2.2s_ease-in-out_infinite] [animation-delay:0.3s]" />

      <span className="relative flex size-9 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 shadow [animation:wiggle_1.2s_ease-in-out_infinite]">
        <Trophy className="size-5 text-white drop-shadow" />
      </span>

      <span className="relative flex items-center gap-1 text-xs font-black tracking-widest text-white/90 uppercase drop-shadow">
        <PartyPopper className="size-3.5" />
        Round winner
        <PartyPopper className="size-3.5 -scale-x-100" />
      </span>

      <span className={cn("relative text-xl text-white drop-shadow-lg sm:text-2xl", TEAM_NAME_CLASS)} style={{ ...teamNameGlowStyle(winner.color), color: "white" }}>
        {winner.name}
      </span>
    </div>
  );
}
