"use client";

import { Button } from "@/components/ui/button";
import { TeamDisc } from "@/components/Disc";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetGame } from "@/lib/store/gameSlice";
import { Team } from "@/lib/store/gameSlice";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { Home, PartyPopper, Sparkles, Trophy } from "lucide-react";

interface WinnerViewProps {
  winners: Team[];
}

export default function WinnerView({ winners }: WinnerViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isTie = winners.length > 1;

  const handleBackToHome = () => {
    dispatch(resetGame());
    router.push("/");
  };

  return (
    <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border-2 border-primary bg-card p-6 text-center shadow-[0_6px_0_0_color-mix(in_oklch,var(--primary),black_25%)] [animation:pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)] sm:p-8">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />
      <Sparkles aria-hidden className="absolute top-6 left-6 size-4 text-accent/70 [animation:pop-in_2.2s_ease-in-out_infinite]" />
      <Sparkles aria-hidden className="absolute right-8 bottom-8 size-3 text-secondary/70 [animation:pop-in_2.6s_ease-in-out_infinite] [animation-delay:0.4s]" />
      <PartyPopper aria-hidden className="absolute top-8 right-8 size-5 text-primary/50 [animation:token-float_3s_ease-in-out_infinite]" />

      <span className="flex size-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_25%)] [animation:wiggle_2.4s_ease-in-out_infinite]">
        <Trophy className="size-8 text-primary" />
      </span>

      <h1 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        {!isTie && <span className="text-muted-foreground">Team</span>}

        {winners.map((team, index) => (
          <span key={team.id} className="inline-flex items-center gap-2">
            <TeamDisc team={team} size={40} />
            <span className={TEAM_NAME_CLASS} style={teamNameGlowStyle(team.color)}>
              {team.name}
            </span>
            {isTie && index < winners.length - 1 && <span className="text-muted-foreground">&amp;</span>}
          </span>
        ))}

        <span className="flex items-center gap-1.5 text-primary">
          <PartyPopper className="size-6" />
          {isTie ? "tied for the win!" : "won!"}
        </span>
      </h1>

      <Button type="button" size="lg" onClick={handleBackToHome} className="transition-transform hover:scale-[1.02]">
        <Home className="size-4" />
        Back to Home
      </Button>
    </div>
  );
}
