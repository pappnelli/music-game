"use client";

import FinalRoundRuleSelector from "@/app/setup/components/FinalRoundRuleSelector";
import GenreSelector from "@/app/setup/components/GenreSelector";
import MusicModeSelector from "@/app/setup/components/MusicModeSelector";
import SongsPerYearSelector from "@/app/setup/components/SongsPerYearSelector";
import WinnerCardsSelector from "@/app/setup/components/WinnerCardsSelector";
import YearRangeSelector from "@/app/setup/components/YearRangeSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { applyNewFilters } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { Disc, Save, Sliders, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

interface GameSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function GameSettingsDialog({ open, onClose }: GameSettingsDialogProps) {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const isSpotifyLoggedIn = !!session;

  const gameState = useAppSelector((s) => s.game);

  const [localSettings, setLocalSettings] = useState({
    selectedGenres: gameState.selectedGenres,
    yearStart: gameState.yearStart,
    yearEnd: gameState.yearEnd,
    songsPerYear: gameState.songsPerYear,
    winCondition: gameState.winCondition,
    finalRoundRule: gameState.finalRoundRule,
    musicMode: gameState.musicMode,
  });

  const handleSave = () => {
    dispatch(applyNewFilters(localSettings));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-app-black border border-border backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] p-6 rounded-2xl z-50 text-foreground font-mono [&>button]:hidden overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-base font-bold font-mono uppercase tracking-wider text-app-white">_GAME_SETTINGS</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3 flex">
          <div className="flex-1 space-y-4 border-r border-border/50 pr-6">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Disc className="w-3.5 h-3.5" />
              Music configuration
            </div>

            <div className="space-y-4">
              <GenreSelector
                genres={gameState.genres}
                selected={localSettings.selectedGenres}
                onChange={(list) => setLocalSettings((s) => ({ ...s, selectedGenres: list }))}
              />

              <YearRangeSelector
                yearStart={localSettings.yearStart}
                yearEnd={localSettings.yearEnd}
                onStartChange={(v) => setLocalSettings((s) => ({ ...s, yearStart: v }))}
                onEndChange={(v) => setLocalSettings((s) => ({ ...s, yearEnd: v }))}
              />

              <SongsPerYearSelector
                value={localSettings.songsPerYear}
                onChange={(v) => setLocalSettings((s) => ({ ...s, songsPerYear: v }))}
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 pl-6">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              Gameplay Rules
            </div>

            <div className="space-y-4">
              <WinnerCardsSelector
                value={localSettings.winCondition}
                onChange={(v) => setLocalSettings((s) => ({ ...s, winCondition: v }))}
              />

              <FinalRoundRuleSelector
                value={localSettings.finalRoundRule}
                onChange={(v) => setLocalSettings((s) => ({ ...s, finalRoundRule: v }))}
              />

              <MusicModeSelector
                value={localSettings.musicMode}
                onChange={(mode) => setLocalSettings((s) => ({ ...s, musicMode: mode }))}
                isSpotifyLoggedIn={isSpotifyLoggedIn}
                signIn={signIn}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-secondary hover:text-app-black hover:shadow-[0_0_15px_var(--color-secondary)] transition-all duration-300 font-mono text-xs uppercase tracking-widest cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-primary/15 border border-primary text-primary hover:bg-primary hover:text-app-black transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb,0,255,200),0.25)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb,0,255,200),0.8)] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
