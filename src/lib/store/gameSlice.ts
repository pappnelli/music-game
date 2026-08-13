import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  genres: string[];
  album?: string;
  spotifyId?: string;
}

export type HunGenreMode = "include" | "exclude" | "only";

export interface Team {
  id: string;
  name: string;
  color: string;
  cards: Song[];
  tokens: number;
  timeline: string[];
}

export interface TokenPlacement {
  teamId: string;
  position: number;
}

export interface GameState {
  status: "idle" | "playing" | "finished" | "aborted";
  musicMode: "qr" | "spotify";
  winCondition: number;
  finalRoundRule: "instant" | "complete";
  genres: string[];
  selectedGenres: string[];
  hunGenreMode: HunGenreMode;
  yearStart: number;
  yearEnd: number;
  songsPerYear: number | null;

  catalog: Song[];
  songs: Song[];
  usedSongs: Song[];
  currentSong: Song | null;
  currentSongIndex: number;

  teams: Team[];
  currentTeamId: string | null;
  roundWinnerId: string | null;
  winnerIds: string[];

  tokens: TokenPlacement[];
  cardPosition: number | null;
  showSolution: boolean;
}

const initialState: GameState = {
  status: "idle",
  musicMode: "qr",
  winCondition: 0,
  finalRoundRule: "instant",
  genres: [],
  selectedGenres: [],
  hunGenreMode: "include",
  yearStart: 1900,
  yearEnd: 2026,
  songsPerYear: null,

  catalog: [],
  songs: [],
  usedSongs: [],
  currentSong: null,
  currentSongIndex: 0,

  teams: [],
  currentTeamId: null,
  roundWinnerId: null,
  winnerIds: [],

  tokens: [],
  cardPosition: null,
  showSolution: false,
};

function drawRandomSong(state: GameState) {
  if (state.songs.length === 0) {
    state.status = "finished";
    return;
  }

  const song = state.songs.shift();

  if (song) {
    state.currentSong = song;
    state.usedSongs.push(song);
  }

  state.showSolution = false;
  state.roundWinnerId = null;
  state.cardPosition = null;
  state.tokens = [];
}

function isCorrectPosition(slotIndex: number, teamCards: Song[], currentSong: Song | null) {
  if (!currentSong) return false;

  const year = currentSong.year;
  const sorted = [...teamCards].sort((a, b) => a.year - b.year);

  if (sorted.length === 0) return true;

  const leftIndex = slotIndex - 1;
  const rightIndex = slotIndex;

  const hasLeft = leftIndex >= 0 && leftIndex < sorted.length;
  const hasRight = rightIndex >= 0 && rightIndex < sorted.length;

  if (hasLeft && hasRight) {
    return sorted[leftIndex].year <= year && year <= sorted[rightIndex].year;
  }

  if (!hasLeft && hasRight) {
    return year <= sorted[rightIndex].year;
  }

  if (hasLeft && !hasRight) {
    return year >= sorted[leftIndex].year;
  }

  return false;
}

// A dal "Hun" (magyar) műfajjal van-e cimkézve, a többi genre-től függetlenül.
export function isHungarianTagged(song: Song): boolean {
  return song.genres.some((g) => g.trim().toLowerCase() === "hun");
}

interface SongFilterCriteria {
  selectedGenres: string[];
  yearStart: number;
  yearEnd: number;
  hunGenreMode: HunGenreMode;
}

// Közös szűrő predikátum: Setup, GameSettingsDialog és az applyNewFilters reducer is ezt használja,
// hogy a "Hun" kezelése (include/exclude/only) mindenhol ugyanúgy viselkedjen.
export function songMatchesFilters(song: Song, criteria: SongFilterCriteria): boolean {
  const { selectedGenres, yearStart, yearEnd, hunGenreMode } = criteria;

  if (song.year < yearStart || song.year > yearEnd) return false;

  const isHun = isHungarianTagged(song);

  if (hunGenreMode === "only") return isHun;
  if (hunGenreMode === "exclude" && isHun) return false;
  if (hunGenreMode === "include" && isHun) return true; // "Hun" mindig átmegy, mint egy hallgatólagosan kijelölt genre

  return selectedGenres.length === 0 || song.genres.some((g) => selectedGenres.includes(g));
}

export function capSongsPerYear(songs: Song[], songsPerYear: number | null): Song[] {
  if (!songsPerYear || songsPerYear <= 0) return songs;

  const countByYear: Record<number, number> = {};
  return songs.filter((song) => {
    const current = countByYear[song.year] ?? 0;
    if (current < songsPerYear) {
      countByYear[song.year] = current + 1;
      return true;
    }
    return false;
  });
}

export function shuffleSongs(songs: Song[]): Song[] {
  const shuffled = [...songs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    storeGlobalCatalog(state, action: PayloadAction<Song[]>) {
      state.catalog = action.payload;
    },
    startGame(
      state,
      action: PayloadAction<{
        songs: Song[];
        teams: Team[];
        startingTokens: number;
        winCondition: number;
        musicMode: "qr" | "spotify";
        finalRoundRule: "instant" | "complete";
        selectedGenres?: string[];
        genres?: string[];
        hunGenreMode?: HunGenreMode;
        yearStart?: number;
        yearEnd?: number;
        songsPerYear?: number | null;
      }>,
    ) {
      const {
        songs,
        teams,
        startingTokens,
        winCondition,
        musicMode,
        finalRoundRule,
        selectedGenres,
        genres,
        hunGenreMode,
        yearStart,
        yearEnd,
        songsPerYear,
      } = action.payload;

      state.status = "playing";
      state.musicMode = musicMode;
      state.winCondition = winCondition;
      state.finalRoundRule = finalRoundRule;
      if (selectedGenres) state.selectedGenres = selectedGenres;
      if (genres) state.genres = genres;
      if (hunGenreMode) state.hunGenreMode = hunGenreMode;
      if (yearStart !== undefined) state.yearStart = yearStart;
      if (yearEnd !== undefined) state.yearEnd = yearEnd;
      if (songsPerYear !== undefined) state.songsPerYear = songsPerYear;

      state.songs = [...songs];
      state.usedSongs = [];
      state.currentSong = null;

      state.teams = teams.map((t) => {
        const song = state.songs.shift();

        if (song) {
          state.usedSongs.push(song);

          return {
            ...t,
            cards: [song],
            tokens: startingTokens,
            timeline: [song.id],
          };
        }

        return {
          ...t,
          cards: [],
          tokens: startingTokens,
          timeline: [],
        };
      });

      state.currentTeamId = state.teams[0]?.id ?? null;
      state.roundWinnerId = null;
      state.winnerIds = [];
      state.tokens = [];
      state.cardPosition = null;
      state.showSolution = false;

      drawRandomSong(state);
    },
    updateActiveGameSettings(
      state,
      action: PayloadAction<{
        filteredSongs: Song[];
        winCondition: number;
      }>,
    ) {
      const { filteredSongs, winCondition } = action.payload;

      state.songs = filteredSongs.filter((song) => !state.usedSongs.some((used) => used.id === song.id));

      state.winCondition = winCondition;
      // talan nem kell ujat huzni, az aktuális dal fut tovább zavartalanul
    },

    placeToken(state, action: PayloadAction<{ teamId: string; position: number }>) {
      const { teamId, position } = action.payload;

      if (teamId === state.currentTeamId) return;

      const team = state.teams.find((t) => t.id === teamId);
      if (!team || team.tokens <= 0) return;

      const alreadyUsed = state.tokens.some((t) => t.teamId === teamId);
      if (alreadyUsed) return;

      const slotTaken = state.tokens.some((t) => t.position === position);
      if (slotTaken) return;

      team.tokens -= 1;
      state.tokens.push({ teamId, position });
    },

    moveToken(state, action: PayloadAction<{ teamId: string; newPosition: number }>) {
      const { teamId, newPosition } = action.payload;

      const slotTaken = state.tokens.some((t) => t.position === newPosition);
      if (slotTaken) return;

      const token = state.tokens.find((t) => t.teamId === teamId);
      if (!token) return;

      token.position = newPosition;
    },

    removeToken(state, action: PayloadAction<{ teamId: string }>) {
      const { teamId } = action.payload;

      const idx = state.tokens.findIndex((t) => t.teamId === teamId);
      if (idx === -1) return;

      const team = state.teams.find((t) => t.id === teamId);
      if (team) team.tokens += 1;

      state.tokens.splice(idx, 1);
    },

    placeCard(state, action: PayloadAction<{ position: number }>) {
      state.cardPosition = action.payload.position;
    },

    moveCard(state, action: PayloadAction<{ newPosition: number }>) {
      state.cardPosition = action.payload.newPosition;
    },

    removeCard(state) {
      state.cardPosition = null;
    },

    setShowSolution(state, action: PayloadAction<boolean>) {
      state.showSolution = action.payload;
      state.roundWinnerId = null;

      if (!action.payload) return;

      const currentTeam = state.teams.find((t) => t.id === state.currentTeamId);
      if (!currentTeam) return;

      if (state.cardPosition != null) {
        if (isCorrectPosition(state.cardPosition, currentTeam.cards, state.currentSong)) {
          state.roundWinnerId = currentTeam.id;
          return;
        }
      }

      for (const team of state.teams) {
        if (team.id === currentTeam.id) continue;

        const token = state.tokens.find((t) => t.teamId === team.id);
        if (!token) continue;

        if (isCorrectPosition(token.position, currentTeam.cards, state.currentSong)) {
          state.roundWinnerId = team.id;
          return;
        }
      }
    },

    nextRound(state, action: PayloadAction<{ tokenWinnerId: string | null } | undefined>) {
      const { tokenWinnerId } = action.payload || { tokenWinnerId: null };

      if (state.roundWinnerId && state.currentSong) {
        const winnerTeam = state.teams.find((t) => t.id === state.roundWinnerId);
        winnerTeam?.cards.push(state.currentSong);

        // const cardCount = winnerTeam?.cards.length ?? 0;
        // if (state.winCondition && cardCount >= state.winCondition) {
        //   state.winnerId = winnerTeam?.id ?? null;
        //   state.status = "finished";
        // }
      }

      if (tokenWinnerId) {
        const team = state.teams.find((t) => t.id === tokenWinnerId);
        if (team) {
          team.tokens += 1;
        }
      }
      const hasAnyTeamReachedWinCondition = state.teams.some((team) => state.winCondition > 0 && team.cards.length >= state.winCondition);

      const currentIndex = state.teams.findIndex((t) => t.id === state.currentTeamId);
      const nextIndex = (currentIndex + 1) % state.teams.length;
      const isRoundOver = nextIndex === 0;

      const shouldFinishGame =
        hasAnyTeamReachedWinCondition && (state.finalRoundRule === "instant" || (state.finalRoundRule === "complete" && isRoundOver));

      if (shouldFinishGame) {
        const maxCards = Math.max(...state.teams.map((t) => t.cards.length));

        const winners = state.teams.filter((t) => t.cards.length === maxCards);

        state.winnerIds = winners.map((w) => w.id);
        state.status = "finished";
      }

      state.currentSong = null;
      state.showSolution = false;
      state.roundWinnerId = null;
      state.tokens = [];
      state.cardPosition = null;

      // const currentIndex = state.teams.findIndex((t) => t.id === state.currentTeamId);
      // const nextIndex = (currentIndex + 1) % state.teams.length;

      if (state.status === "playing") {
        state.currentTeamId = state.teams[nextIndex].id;
        drawRandomSong(state);
      }
    },

    drawNewCard(state) {
      for (const token of state.tokens) {
        const team = state.teams.find((t) => t.id === token.teamId);
        if (team) {
          team.tokens += 1;
        }
      }

      state.tokens = [];
      state.cardPosition = null;

      drawRandomSong(state);
    },

    abortGame(state) {
      state.status = "aborted";
      state.currentSong = null;
      state.tokens = [];
      state.cardPosition = null;
      state.showSolution = false;

      // return initialState;
    },

    clearAbortedStatus(state) {
      if (state.status === "aborted") {
        state.status = "idle";
      }
    },

    loadSavedGame(state, action: PayloadAction<GameState>) {
      return { ...state, ...action.payload };
    },

    resetGame(state) {
      return {
        ...initialState,
        catalog: state.catalog,
      };
    },

    applyNewFilters: (
      state,
      action: PayloadAction<{
        selectedGenres: string[];
        hunGenreMode: HunGenreMode;
        yearStart: number;
        yearEnd: number;
        songsPerYear: number | null;
        winCondition: number;
        finalRoundRule: "instant" | "complete";
        musicMode: "qr" | "spotify";
      }>,
    ) => {
      const { selectedGenres, hunGenreMode, yearStart, yearEnd, songsPerYear, winCondition, finalRoundRule, musicMode } = action.payload;

      state.selectedGenres = selectedGenres;
      state.hunGenreMode = hunGenreMode;
      state.yearStart = yearStart;
      state.yearEnd = yearEnd;
      state.songsPerYear = songsPerYear;
      state.winCondition = winCondition;
      state.finalRoundRule = finalRoundRule;
      state.musicMode = musicMode;

      const usedIds = new Set(state.usedSongs.map((s) => s.id));
      const availableSongs = state.catalog.filter(
        (song) => !usedIds.has(song.id) && songMatchesFilters(song, { selectedGenres, yearStart, yearEnd, hunGenreMode }),
      );

      // 6. Frissítjük a hátramaradt dallistát (songs / deck)
      state.songs = shuffleSongs(capSongsPerYear(availableSongs, songsPerYear));
    },
  },
});

export const {
  storeGlobalCatalog,
  startGame,
  updateActiveGameSettings,
  placeToken,
  moveToken,
  removeToken,
  placeCard,
  moveCard,
  removeCard,
  setShowSolution,
  nextRound,
  drawNewCard,
  abortGame,
  clearAbortedStatus,
  loadSavedGame,
  resetGame,
  applyNewFilters,
} = gameSlice.actions;

export default gameSlice.reducer;

export const selectFilteredSongs = (state: RootState) => {
  const catalog = state.game.catalog;
  const { genre, hunGenreMode, yearStart, yearEnd, songsPerYear } = state.setup;

  // 1. lépés: Alapszűrés évek, műfajok és a "Hun" mód alapján
  const baseFiltered = catalog.filter((song) =>
    songMatchesFilters(song, { selectedGenres: genre, yearStart, yearEnd, hunGenreMode }),
  );

  // 2. lépés: Ha a songsPerYear null, akkor nem korlátozzuk a darabszámot, de a biztonság kedvéért megkeverjük a paklit
  if (songsPerYear === null || songsPerYear <= 0) {
    return shuffleSongs(baseFiltered);
  }

  // 3. lépés: Teljes keverés a RANDOM kiválasztáshoz, majd évenként csak az első 'songsPerYear' darab marad
  return capSongsPerYear(shuffleSongs(baseFiltered), songsPerYear);
};
