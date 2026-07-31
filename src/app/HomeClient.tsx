"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetSetup } from "@/lib/store/setupSlice";
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const status = useAppSelector((s) => s.game.status);

  function handleNewGame() {
    dispatch(resetSetup());
    router.push("/setup");
  }

  function handleContinue() {
    router.push("/game");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 p-8">
      <div className="absolute top-4 right-4 z-11">
        <ThemeToggle />
      </div>

      {/* Neon logó hatás */}
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
          MUSIC_GAME
        </h1>
        <p className="text-teams-cyan font-mono text-sm tracking-[0.2em] uppercase opacity-70">System: Ready for play</p>
      </div>

      {/* Menü kártya */}
      <div className="w-full max-w-sm bg-card backdrop-blur-md border border-border p-8 rounded-xl shadow-[var(--shadow-glow)]">
        <div className="flex flex-col gap-4">
          <Button
            className="w-full h-14 text-lg font-bold uppercase tracking-widest bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-app-black hover:shadow-[0_0_20px_var(--color-primary)] transition-all duration-300 rounded-lg"
            onClick={handleNewGame}
          >
            Setup new game
          </Button>

          <Button
            className="w-full h-14 text-lg font-bold uppercase tracking-widest bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-app-black hover:shadow-[0_0_20px_var(--color-secondary)] transition-all duration-300 rounded-lg"
            disabled={status !== "playing" && status !== "finished"}
            onClick={handleContinue}
          >
            Continue last
          </Button>
        </div>

        {/* Dekoratív elem a kártya alján */}
        <div className="mt-8 pt-4 border-t border-border/30 text-center">
          <span className="text-xs font-mono text-foreground/40 uppercase">v.1.0.0 // Access permitted</span>
        </div>
      </div>
    </div>
  );
}
