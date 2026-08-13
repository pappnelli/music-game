"use client";

import AppBackground from "@/components/AppBackground";
import Disc from "@/components/Disc";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { loadSongs } from "@/lib/songLoader";
import { clearAbortedStatus, Team as GameTeam, selectFilteredSongs, Song, startGame, storeGlobalCatalog } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addTeam,
  initFiltersFromCatalog,
  removeTeam,
  reorderTeams,
  resetSetup,
  setFinalRoundRule,
  setGenre,
  setHunGenreMode,
  setMusicMode,
  setSongsPerYear,
  setStartingTokens,
  setWinCondition,
  setYearEnd,
  setYearStart,
  Team,
} from "@/lib/store/setupSlice";
import { getUniqueTeamColor } from "@/lib/teamColors";
import { useAppNavigate } from "@/lib/useAppNavigate";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { Disc3, ListMusic, Sliders, Users } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import BackButton from "./components/BackButton";
import FinalRoundRuleSelector from "./components/FinalRoundRuleSelector";
import GenreSelector from "./components/GenreSelector";
import HunGenreSelector from "./components/HunGenreSelector";
import MusicModeSelector from "./components/MusicModeSelector";
import NewTeamInput from "./components/NewTeamInput";
import SongsPerYearSelector from "./components/SongsPerYearSelector";
import StartGameButton from "./components/StartGameButton";
import StartTokenSelector from "./components/StartTokenSelector";
import TeamList from "./components/TeamList";
import WinnerCardsSelector from "./components/WinnerCardsSelector";
import YearRangeSelector from "./components/YearRangeSelector";

export default function SetupClient() {
  const navigate = useAppNavigate();
  const dispatch = useAppDispatch();
  const [isParsingExcel, setIsParsingExcel] = useState(true);

  const { status } = useSession();
  const isSpotifyLoggedIn = status === "authenticated";

  const { genre, genres, hunGenreMode, yearStart, yearEnd, songsPerYear, startingTokens, winCondition, teams, musicMode, finalRoundRule } =
    useAppSelector((s) => s.setup);

  const gameStatus = useAppSelector((s) => s.game.status);
  const filteredSongs = useAppSelector(selectFilteredSongs);

  const trimmedTeamNames = teams.map((t) => t.name.trim().toLowerCase());
  const hasDuplicateTeamNames = new Set(trimmedTeamNames).size !== trimmedTeamNames.length;

  const missingRequirements = [
    teams.length < 2 && "Add at least 2 teams",
    hasDuplicateTeamNames && "Team names must be unique",
    hunGenreMode !== "only" && genre.length === 0 && "Select at least one genre",
    (!yearStart || !yearEnd) && "Set a valid year range",
    !!yearStart && !!yearEnd && yearStart > yearEnd && "Start year must be before end year",
    filteredSongs.length < teams.length * 2 && "Not enough songs match your filters",
    !winCondition && "Set how many cards win the game",
    musicMode === "spotify" && !isSpotifyLoggedIn && "Connect Spotify to continue",
  ].filter(Boolean) as string[];

  const isStartDisabled = missingRequirements.length > 0;

  function formatCatalogWithIds(rawSongs: Song[]) {
    const yearCounters: Record<number, number> = {};
    return rawSongs.map((song) => {
      const year = Number(song.year);
      if (!yearCounters[year]) yearCounters[year] = 1;
      const index = yearCounters[year]++;
      const paddedIndex = String(index).padStart(3, "0");
      return { ...song, id: `${year}-${paddedIndex}` };
    });
  }

  useEffect(() => {
    async function loadAndInitializeCatalog() {
      try {
        setIsParsingExcel(true);
        const excelData = await loadSongs();
        const finalCatalog = formatCatalogWithIds(excelData);

        // 1. Eltároljuk a nyers adatbázist a game slice-ban
        dispatch(storeGlobalCatalog(finalCatalog));

        // 2. Kiszámoljuk az elérhető műfajokat és éveket, inicializáljuk a szűrőket
        dispatch(initFiltersFromCatalog(finalCatalog));
      } catch (error) {
        console.error("Hiba történt a dalok inicializálása során:", error);
      } finally {
        setIsParsingExcel(false);
      }
    }

    loadAndInitializeCatalog();
  }, [dispatch]);

  useEffect(() => {
    if (gameStatus === "aborted") {
      dispatch(clearAbortedStatus());
    }
  }, [gameStatus, dispatch]);

  function handleBack() {
    navigate("/");
  }

  function handleStart() {
    const initializedTeams: GameTeam[] = teams.map((team) => ({
      id: team.id,
      name: team.name,
      color: team.color,
      cards: [],
      tokens: startingTokens,
      timeline: [],
    }));

    dispatch(
      startGame({
        selectedGenres: genre,
        genres,
        hunGenreMode,
        yearStart,
        yearEnd,
        songsPerYear,
        songs: filteredSongs,
        teams: initializedTeams,
        startingTokens: startingTokens,
        winCondition: winCondition,
        musicMode: musicMode,
        finalRoundRule,
      }),
    );

    dispatch(resetSetup());

    navigate("/game", "Starting the game…");
  }

  function handleRemoveTeam(id: string) {
    dispatch(removeTeam(id));
  }

  function handleReorderTeams(newTeams: Team[]) {
    dispatch(reorderTeams(newTeams));
  }

  const mainRef = useRef<HTMLElement>(null);
  const mainFadeStyle = useEdgeFadeStyle(mainRef, "y");
  const musicCardRef = useRef<HTMLDivElement>(null);
  const musicCardFadeStyle = useEdgeFadeStyle(musicCardRef, "y");
  const rulesCardRef = useRef<HTMLDivElement>(null);
  const rulesCardFadeStyle = useEdgeFadeStyle(rulesCardRef, "y");
  const teamListRef = useRef<HTMLDivElement>(null);
  const teamListFadeStyle = useEdgeFadeStyle(teamListRef, "y");

  if (isParsingExcel) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Disc3 className="size-14 animate-[spin_1.4s_linear_infinite] text-primary" />
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">Loading the song catalog…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <AppBackground />

      <header className="flex items-center justify-between gap-3 border-b-2 border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Disc size={22} spin shadow="0 1px 0 0 color-mix(in oklch, var(--primary), black 30%)" />
          <h1 className="text-lg font-black tracking-tight text-foreground sm:text-xl">Game Setup</h1>
        </div>
        <ThemeToggle />
      </header>

      <main
        ref={mainRef}
        style={mainFadeStyle}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-hidden place-content-center"
      >
        <div className="mx-auto flex h-fit max-h-full max-w-[1600px] flex-col items-stretch gap-5 lg:flex-row lg:justify-center">
          <Card
            ref={musicCardRef}
            style={musicCardFadeStyle}
            className="gap-4 p-4 sm:p-5 lg:w-80 lg:shrink-0 lg:overflow-y-auto xl:w-96 [animation:pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_backwards]"
          >
            <h2 className="flex items-center gap-2 text-sm font-black tracking-wide text-foreground uppercase">
              <ListMusic className="size-4 text-primary" />
              Music
            </h2>

            <GenreSelector
              genres={genres}
              selected={genre}
              onChange={(list) => dispatch(setGenre(list))}
              disabled={hunGenreMode === "only"}
            />

            <HunGenreSelector value={hunGenreMode} onChange={(mode) => dispatch(setHunGenreMode(mode))} />

            <YearRangeSelector
              yearStart={yearStart}
              yearEnd={yearEnd}
              onStartChange={(v) => dispatch(setYearStart(v))}
              onEndChange={(v) => dispatch(setYearEnd(v))}
            />

            <SongsPerYearSelector value={songsPerYear} onChange={(v) => dispatch(setSongsPerYear(v))} />

            <p className="text-xs font-semibold text-muted-foreground">{filteredSongs.length} songs match your filters.</p>
          </Card>

          <Card
            ref={rulesCardRef}
            style={rulesCardFadeStyle}
            className="gap-4 p-4 sm:p-5 lg:w-80 lg:shrink-0 lg:overflow-y-auto xl:w-96 [animation:pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_backwards] [animation-delay:100ms]"
          >
            <h2 className="flex items-center gap-2 text-sm font-black tracking-wide text-foreground uppercase">
              <Sliders className="size-4 text-secondary" />
              Rules
            </h2>

            <StartTokenSelector value={startingTokens} onChange={(v) => dispatch(setStartingTokens(v))} />
            <WinnerCardsSelector value={winCondition} onChange={(v) => dispatch(setWinCondition(v))} />
            <FinalRoundRuleSelector value={finalRoundRule} onChange={(v) => dispatch(setFinalRoundRule(v))} />

            <MusicModeSelector
              value={musicMode}
              onChange={(mode) => dispatch(setMusicMode(mode))}
              isSpotifyLoggedIn={isSpotifyLoggedIn}
              signIn={signIn}
            />
          </Card>

          <Card className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-5 lg:max-w-md lg:overflow-hidden [animation:pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_backwards] [animation-delay:200ms]">
            <h2 className="flex items-center gap-2 text-sm font-black tracking-wide text-foreground uppercase">
              <Users className="size-4 text-accent" />
              Teams
            </h2>

            <NewTeamInput onAddTeam={(name) => dispatch(addTeam({ id: crypto.randomUUID(), name, color: getUniqueTeamColor(teams) }))} />

            <div ref={teamListRef} style={teamListFadeStyle} className="min-h-0 flex-1 lg:overflow-y-auto">
              <TeamList teams={teams} onRemoveTeam={handleRemoveTeam} reorderTeams={handleReorderTeams} />
            </div>
          </Card>
        </div>
      </main>

      <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t-2 border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        {isStartDisabled && (
          <p className="absolute bottom-full left-0 mb-2 w-full px-4 text-right text-xs font-semibold text-secondary sm:px-6">
            {missingRequirements[0]}
          </p>
        )}

        <BackButton onClick={handleBack} />
        <StartGameButton disabled={isStartDisabled} onClick={handleStart} />
      </footer>
    </div>
  );
}
