import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Song {
  id: string;
  year: number | string;
  title: string;
  artist: string;
  genres: string[];
  spotify_url?: string;
}

interface SetupState {
  genre: string[];
  genres: string[];
  yearStart: number;
  yearEnd: number;
  minAvailableYear: number;
  maxAvailableYear: number;
  songsPerYear: number | null;
  startingTokens: number;
  winCondition: number;
  teams: Team[];
  musicMode: "qr" | "spotify";
  finalRoundRule: "instant" | "complete";
}

const initialState: SetupState = {
  genre: [],
  genres: [],
  yearStart: 1900,
  yearEnd: 2030,
  minAvailableYear: 1900,
  maxAvailableYear: 2030,
  songsPerYear: null,
  startingTokens: 3,
  winCondition: 10,
  teams: [],
  musicMode: "qr",
  finalRoundRule: "instant",
};

export const setupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {
    initFiltersFromCatalog(state, action: PayloadAction<Song[]>) {
      const catalog = action.payload;

      // 1. Műfajok kinyerése vesszővel elválasztva (a chart_name mezőből). A magyar műfajok
      // (hun-pop, hun-rock, stb.) egyedi genre értékek, ugyanúgy szerepelnek itt, mint bármelyik
      // más -- a GenreSelector csoportosítja/rendezi őket külön, dedikált szekcióba a UI-ban.
      const uniqueGenres = Array.from(new Set(catalog.flatMap((song) => song.genres))).sort();

      // 2. Évszámok határainak kiszámítása
      const years = catalog.map((song) => Number(song.year)).filter(Boolean);
      const minYear = years.length > 0 ? Math.min(...years) : 1900;
      const maxYear = years.length > 0 ? Math.max(...years) : 2030;

      // 3. Állapot frissítése
      state.genres = uniqueGenres;
      state.genre = uniqueGenres; // Alapértelmezetten minden műfaj legyen kijelölve
      state.minAvailableYear = minYear;
      state.maxAvailableYear = maxYear;
      state.yearStart = minYear;
      state.yearEnd = maxYear;
    },
    setGenre(state, action: PayloadAction<string[]>) {
      state.genre = action.payload;
    },
    setYearStart(state, action: PayloadAction<number>) {
      state.yearStart = action.payload;
    },
    setYearEnd(state, action: PayloadAction<number>) {
      state.yearEnd = action.payload;
    },
    setSongsPerYear(state, action: PayloadAction<number | null>) {
      state.songsPerYear = action.payload;
    },
    setStartingTokens(state, action: PayloadAction<number>) {
      state.startingTokens = action.payload;
    },
    setWinCondition(state, action: PayloadAction<number>) {
      state.winCondition = action.payload;
    },
    addTeam(state, action: PayloadAction<Team>) {
      state.teams.push(action.payload);
    },
    editTeam(state, action: PayloadAction<Team>) {
      const team = state.teams.find((t) => t.id === action.payload.id);
      if (team) {
        team.name = action.payload.name;
        team.color = action.payload.color;
      }
    },
    removeTeam(state, action: PayloadAction<string>) {
      state.teams = state.teams.filter((t) => t.id !== action.payload);
    },
    reorderTeams(state, action: PayloadAction<Team[]>) {
      state.teams = action.payload;
    },
    setMusicMode(state, action: PayloadAction<"qr" | "spotify">) {
      state.musicMode = action.payload;
    },
    setFinalRoundRule(state, action: PayloadAction<"instant" | "complete">) {
      state.finalRoundRule = action.payload;
    },
    resetSetup() {
      return initialState;
    },
  },
});

export const {
  initFiltersFromCatalog,
  setGenre,
  setYearStart,
  setYearEnd,
  setSongsPerYear,
  setStartingTokens,
  setWinCondition,
  addTeam,
  editTeam,
  removeTeam,
  reorderTeams,
  setMusicMode,
  setFinalRoundRule,
  resetSetup,
} = setupSlice.actions;

export default setupSlice.reducer;
