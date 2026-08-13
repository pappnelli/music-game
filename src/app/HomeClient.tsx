"use client";

import AppBackground from "@/components/AppBackground";
import Disc from "@/components/Disc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAppNavigate } from "@/lib/useAppNavigate";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetSetup } from "@/lib/store/setupSlice";
import { ListMusic, PlayCircle, Sparkles } from "lucide-react";

export default function HomeClient() {
  const navigate = useAppNavigate();
  const dispatch = useAppDispatch();

  const status = useAppSelector((s) => s.game.status);
  const canContinue = status === "playing" || status === "finished";

  function handleNewGame() {
    dispatch(resetSetup());
    navigate("/setup", "Setting up your game…");
  }

  function handleContinue() {
    navigate("/game", "Loading your game…");
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <AppBackground />

      <div className="absolute top-6 right-6 z-10 [animation:pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4 [animation:pop-in_0.6s_cubic-bezier(0.34,1.56,0.64,1)]">
          <span className="relative flex size-20 items-center justify-center rounded-3xl border-2 border-primary bg-primary/10 shadow-[0_5px_0_0_color-mix(in_oklch,var(--primary),black_30%)] [animation:token-float_4s_ease-in-out_infinite]">
            <Disc size={44} spin spinDuration="5s" shadow="0 2px 0 0 color-mix(in oklch, var(--primary), black 30%)" />
            <Sparkles className="absolute -top-2 -right-2 size-5 text-secondary [animation:pop-in_2s_ease-in-out_infinite]" />
          </span>

          <div>
            <h1 className="text-5xl font-black tracking-tight text-foreground">
              MUSIC <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">GAME</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">Guess the year. Race the timeline. Steal the win.</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button size="lg" onClick={handleNewGame} className="h-14 w-full text-base transition-transform hover:scale-[1.02]">
            <PlayCircle className="size-5" />
            Start New Game
          </Button>

          <Button
            size="lg"
            variant="outline"
            disabled={!canContinue}
            onClick={handleContinue}
            className="h-14 w-full text-base transition-transform hover:scale-[1.02]"
          >
            <ListMusic className="size-5" />
            Continue Last Game
          </Button>
        </div>
      </div>
    </div>
  );
}
