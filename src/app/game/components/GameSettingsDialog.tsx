"use client";

import FinalRoundRuleSelector from "@/app/setup/components/FinalRoundRuleSelector";
import GenreSelector from "@/app/setup/components/GenreSelector";
import MusicModeSelector from "@/app/setup/components/MusicModeSelector";
import SongsPerYearSelector from "@/app/setup/components/SongsPerYearSelector";
import WinnerCardsSelector from "@/app/setup/components/WinnerCardsSelector";
import YearRangeSelector from "@/app/setup/components/YearRangeSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { applyNewFilters } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { ListMusic, Settings, Sliders } from "lucide-react";
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary),black_25%)]">
              <Settings className="size-4 text-primary" />
            </span>
            Game settings
          </DialogTitle>
        </DialogHeader>

        {/* Two boxed columns, same as Setup -- each is one panel holding its fields flat, not a
            stack of per-field cards (box-unification rule: a bordered panel is the only box a
            screen needs). Stacks to one column below sm. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="gap-4 p-4">
            <h3 className="flex items-center gap-2 text-xs font-black tracking-wide text-foreground uppercase">
              <ListMusic className="size-4 text-primary" />
              Music configuration
            </h3>

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

            <SongsPerYearSelector value={localSettings.songsPerYear} onChange={(v) => setLocalSettings((s) => ({ ...s, songsPerYear: v }))} />

            <MusicModeSelector
              value={localSettings.musicMode}
              onChange={(mode) => setLocalSettings((s) => ({ ...s, musicMode: mode }))}
              isSpotifyLoggedIn={isSpotifyLoggedIn}
              signIn={signIn}
            />
          </Card>

          <Card className="gap-4 p-4">
            <h3 className="flex items-center gap-2 text-xs font-black tracking-wide text-foreground uppercase">
              <Sliders className="size-4 text-secondary" />
              Gameplay rules
            </h3>

            <WinnerCardsSelector value={localSettings.winCondition} onChange={(v) => setLocalSettings((s) => ({ ...s, winCondition: v }))} />

            <FinalRoundRuleSelector
              value={localSettings.finalRoundRule}
              onChange={(v) => setLocalSettings((s) => ({ ...s, finalRoundRule: v }))}
            />
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
