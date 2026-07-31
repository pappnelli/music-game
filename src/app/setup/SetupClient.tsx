"use client";

import { loadSongs } from "@/lib/songLoader";
import { Team as GameTeam, selectFilteredSongs, Song, startGame, storeGlobalCatalog } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addTeam,
  editTeam,
  initFiltersFromCatalog,
  removeTeam,
  reorderTeams,
  resetSetup,
  setFinalRoundRule,
  setGenre,
  setMusicMode,
  setSongsPerYear,
  setStartingTokens,
  setWinCondition,
  setYearEnd,
  setYearStart,
  Team,
} from "@/lib/store/setupSlice";
import { getUniqueTeamColor } from "@/lib/teamColors";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BackButton from "./components/BackButton";
import GenreSelector from "./components/GenreSelector";
import MusicModeSelector from "./components/MusicModeSelector";
import NewTeamInput from "./components/NewTeamInput";
import SongsPerYearSelector from "./components/SongsPerYearSelector";
import StartGameButton from "./components/StartGameButton";
import StartTokenSelector from "./components/StartTokenSelector";
import TeamList from "./components/TeamList";
import WinnerCardsSelector from "./components/WinnerCardsSelector";
import YearRangeSelector from "./components/YearRangeSelector";
import FinalRoundRuleSelector from "./components/FinalRoundRuleSelector";
import ThemeToggle from "@/components/ThemeToggle";

export default function SetupClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isParsingExcel, setIsParsingExcel] = useState(true);

  const { status } = useSession();
  const isSpotifyLoggedIn = status === "authenticated";

  const { genre, genres, yearStart, yearEnd, songsPerYear, startingTokens, winCondition, teams, musicMode, finalRoundRule } =
    useAppSelector((s) => s.setup);

  const filteredSongs = useAppSelector(selectFilteredSongs);

  const isStartDisabled =
    teams.length < 2 ||
    filteredSongs.length < teams.length * 2 ||
    genre.length === 0 ||
    !yearStart ||
    !yearEnd ||
    !winCondition ||
    (musicMode === "spotify" && !isSpotifyLoggedIn);

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

  function handleBack() {
    router.push("/"); // vagy ahova vissza akarsz menni
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

    router.push("/game");
  }

  function handleRemoveTeam(id: string) {
    dispatch(removeTeam(id));
  }

  function handleReorderTeams(newTeams: Team[]) {
    dispatch(reorderTeams(newTeams));
  }

  if (isParsingExcel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-app-black">
        <div className="relative w-16 h-16 animate-spin">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />

          <div
            className="absolute inset-0 border-4 border-transparent rounded-full"
            style={{
              background: "linear-gradient(to right, var(--primary), var(--secondary)) border-box",
              mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              backgroundOrigin: "border-box",
            }}
          />
        </div>
        <p className="font-mono text-primary uppercase tracking-[0.3em] animate-pulse">Initializing Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto flex flex-col gap-4 p-8">
      <div className="absolute top-4 right-4 z-11">
        <ThemeToggle />
      </div>

      <h2 className="text-5xl font-black text-center font-800 uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-app-white to-gray-500 drop-shadow-[var(--shadow-glow)]">
        System Setup
      </h2>

      <div className="w-full grid grid-cols-9 gap-4">
        <div className="col-span-3 flex flex-col gap-4 p-4 rounded-2xl bg-card border border-app-white/5 backdrop-blur-xl  shadow-[var(--shadow-glow)]">
          <h3 className="text-sm font-mono text-secondary uppercase tracking-[0.2em]">{"// Music configuration"}</h3>

          <GenreSelector genres={genres} selected={genre} onChange={(list) => dispatch(setGenre(list))} />

          <YearRangeSelector
            yearStart={yearStart}
            yearEnd={yearEnd}
            onStartChange={(v) => dispatch(setYearStart(v))}
            onEndChange={(v) => dispatch(setYearEnd(v))}
          />

          <SongsPerYearSelector value={songsPerYear} onChange={(v) => dispatch(setSongsPerYear(v))} />
        </div>

        <div className="col-span-3 flex flex-col gap-4 p-4 rounded-2xl bg-card border border-app-white/5 backdrop-blur-xl shadow-[var(--shadow-glow)]">
          <h3 className="text-sm font-mono text-secondary uppercase tracking-[0.2em]">{"// Gameplay Rules"}</h3>

          <StartTokenSelector value={startingTokens} onChange={(v) => dispatch(setStartingTokens(v))} />

          <WinnerCardsSelector value={winCondition} onChange={(v) => dispatch(setWinCondition(v))} />

          <FinalRoundRuleSelector value={finalRoundRule} onChange={(v) => dispatch(setFinalRoundRule(v))} />

          <MusicModeSelector
            value={musicMode}
            onChange={(mode) => dispatch(setMusicMode(mode))}
            isSpotifyLoggedIn={isSpotifyLoggedIn}
            signIn={signIn}
          />
        </div>

        <div className="col-span-3 flex flex-col gap-4 p-4 rounded-2xl bg-card border border-app-white/5 backdrop-blur-xl shadow-[var(--shadow-glow)]">
          <h3 className="text-sm font-mono text-secondary uppercase tracking-[0.2em]">{"// Active Teams"}</h3>
          <NewTeamInput onAddTeam={(name) => dispatch(addTeam({ id: crypto.randomUUID(), name, color: getUniqueTeamColor(teams) }))} />
          <TeamList teams={teams} onRemoveTeam={handleRemoveTeam} reorderTeams={handleReorderTeams} />
        </div>
      </div>

      {/* TODO */}
      <div className="flex items-center justify-center gap-6">
        <BackButton onClick={handleBack} />
        <StartGameButton disabled={isStartDisabled} onClick={handleStart} />
      </div>
    </div>
  );
}
