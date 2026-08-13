"use client";

import FinalRoundRuleSelector from "@/app/setup/components/FinalRoundRuleSelector";
import GenreSelector from "@/app/setup/components/GenreSelector";
import HunGenreSelector from "@/app/setup/components/HunGenreSelector";
import MusicModeSelector from "@/app/setup/components/MusicModeSelector";
import SongsPerYearSelector from "@/app/setup/components/SongsPerYearSelector";
import WinnerCardsSelector from "@/app/setup/components/WinnerCardsSelector";
import YearRangeSelector from "@/app/setup/components/YearRangeSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { applyNewFilters, capSongsPerYear, songMatchesFilters } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { ListMusic, Settings, Sliders } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useRef, useState } from "react";

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
    hunGenreMode: gameState.hunGenreMode,
    yearStart: gameState.yearStart,
    yearEnd: gameState.yearEnd,
    songsPerYear: gameState.songsPerYear,
    winCondition: gameState.winCondition,
    finalRoundRule: gameState.finalRoundRule,
    musicMode: gameState.musicMode,
  });

  // Hány dal felelne meg a még nem alkalmazott (helyi) beállításoknak — ez adja a "nincs elég dal" ellenőrzés alapját.
  const matchingSongsCount = useMemo(() => {
    const matched = gameState.catalog.filter((song) =>
      songMatchesFilters(song, {
        selectedGenres: localSettings.selectedGenres,
        yearStart: localSettings.yearStart,
        yearEnd: localSettings.yearEnd,
        hunGenreMode: localSettings.hunGenreMode,
      }),
    );
    return capSongsPerYear(matched, localSettings.songsPerYear).length;
  }, [gameState.catalog, localSettings]);

  const trimmedTeamNames = gameState.teams.map((t) => t.name.trim().toLowerCase());
  const hasDuplicateTeamNames = new Set(trimmedTeamNames).size !== trimmedTeamNames.length;

  const missingRequirements = [
    hasDuplicateTeamNames && "Team names must be unique",
    localSettings.hunGenreMode !== "only" && localSettings.selectedGenres.length === 0 && "Select at least one genre",
    (!localSettings.yearStart || !localSettings.yearEnd) && "Set a valid year range",
    !!localSettings.yearStart &&
      !!localSettings.yearEnd &&
      localSettings.yearStart > localSettings.yearEnd &&
      "Start year must be before end year",
    matchingSongsCount < gameState.teams.length * 2 && "Not enough songs match your filters",
    !localSettings.winCondition && "Set how many cards win the game",
    localSettings.musicMode === "spotify" && !isSpotifyLoggedIn && "Connect Spotify to continue",
  ].filter(Boolean) as string[];

  const isSaveDisabled = missingRequirements.length > 0;

  const handleSave = () => {
    if (isSaveDisabled) return;
    dispatch(applyNewFilters(localSettings));
    onClose();
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const fadeStyle = useEdgeFadeStyle(contentRef, "y");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent ref={contentRef} style={fadeStyle} className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
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
              disabled={localSettings.hunGenreMode === "only"}
            />

            <HunGenreSelector
              value={localSettings.hunGenreMode}
              onChange={(mode) => setLocalSettings((s) => ({ ...s, hunGenreMode: mode }))}
            />

            <YearRangeSelector
              yearStart={localSettings.yearStart}
              yearEnd={localSettings.yearEnd}
              onStartChange={(v) => setLocalSettings((s) => ({ ...s, yearStart: v }))}
              onEndChange={(v) => setLocalSettings((s) => ({ ...s, yearEnd: v }))}
            />

            <SongsPerYearSelector value={localSettings.songsPerYear} onChange={(v) => setLocalSettings((s) => ({ ...s, songsPerYear: v }))} />
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

            <MusicModeSelector
              value={localSettings.musicMode}
              onChange={(mode) => setLocalSettings((s) => ({ ...s, musicMode: mode }))}
              isSpotifyLoggedIn={isSpotifyLoggedIn}
              signIn={signIn}
            />
          </Card>
        </div>

        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {isSaveDisabled && <p className="text-right text-xs font-semibold text-secondary">{missingRequirements[0]}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="button" onClick={handleSave} disabled={isSaveDisabled}>
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
