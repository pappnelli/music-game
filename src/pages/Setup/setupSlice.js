import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songs: [],
  genre: "",
  yearStart: null,
  yearEnd: null,
  songsPerYear: null,
  teams: [],
  winCondition: 10,
  isCreatingNewGame: false,
  available_colors: [
    "var(--team-1)",
    "var(--team-2)",
    "var(--team-3)",
    "var(--team-4)",
    "var(--team-5)",
    "var(--team-6)",
    "var(--team-7)",
    "var(--team-8)",
  ],
  musicMode: "qr",
};

function renumber(state) {
  state.teams = state.teams.map((t, i) => ({ ...t, id: i + 1 }));
}

const setupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {
    setSongs(state, action) {
      state.songs = action.payload;
    },
    setGenre(state, action) {
      state.genre = action.payload;
    },
    setYearStart(state, action) {
      state.yearStart = action.payload;
    },
    setYearEnd(state, action) {
      state.yearEnd = action.payload;
    },

    setSongsPerYear(state, action) {
      state.songsPerYear = action.payload;
    },

    addTeam(state, action) {
      const name = action.payload.trim();

      if (!name) return;

      if (state.available_colors.length === 0) return;

      const idx = Math.floor(Math.random() * state.available_colors.length);
      const color = state.available_colors[idx];

      state.available_colors.splice(idx, 1);

      state.teams.push({ id: state.teams.length + 1, name, color });
    },
    removeTeam(state, action) {
      const id = action.payload;

      const team = state.teams.find((t) => t.id === id);
      if (!team) return;

      state.available_colors.push(team.color);

      state.teams = state.teams.filter((t) => t.id !== id);

      renumber(state);
    },
    editTeam(state, action) {
      const { id, name, color: newColor } = action.payload;

      const team = state.teams.find((t) => t.id === id);
      if (!team) return;

      if (name) {
        team.name = name.trim();
      }

      if (newColor && newColor !== team.color) {
        state.available_colors.push(team.color);

        const idx = state.available_colors.indexOf(newColor);
        if (idx !== -1) {
          state.available_colors.splice(idx, 1);
        }

        team.color = newColor;
      }
    },
    moveTeam(state, action) {
      const { fromId, toId } = action.payload;

      if (fromId === toId) return;

      const moved = state.teams.find((t) => t.id === fromId);
      if (!moved) return;

      state.teams = state.teams.filter((t) => t.id !== fromId);

      state.teams.splice(toId - 1, 0, moved);

      renumber(state);
    },
    resetSetup(state) {
      // return initialState;

      const genresFromXLS = [...new Set(state.songs.flatMap((s) => s.chart_name.split(",")).map((g) => g.trim()))];
      state.genre = genresFromXLS;

      const years = state.songs.map((s) => Number(s.year)).filter(Boolean);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      state.yearStart = minYear;
      state.yearEnd = maxYear;

      state.songsPerYear = null;
      state.teams = [];
      state.winCondition = 10;
      state.isCreatingNewGame = false;
      state.available_colors = [
        "var(--team-1)",
        "var(--team-2)",
        "var(--team-3)",
        "var(--team-4)",
        "var(--team-5)",
        "var(--team-6)",
        "var(--team-7)",
        "var(--team-8)",
      ];
      state.musicMode = "qr";
    },
    setWinCondition(state, action) {
      state.winCondition = action.payload;
    },
    startCreatingNewGame(state) {
      const genresFromXLS = [...new Set(state.songs.flatMap((s) => s.chart_name.split(",")).map((g) => g.trim()))];
      state.genre = genresFromXLS;

      const years = state.songs.map((s) => Number(s.year)).filter(Boolean);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      state.yearStart = minYear;
      state.yearEnd = maxYear;

      state.isCreatingNewGame = true;
    },
    cancelCreatingNewGame(state) {
      state.isCreatingNewGame = false;
    },
    setMusicMode(state, action) {
      state.musicMode = action.payload;
    }, //todo setmusicmode ingamesettings
  },
});

export const {
  setSongs,
  setGenre,
  setYearStart,
  setYearEnd,
  setSongsPerYear,
  addTeam,
  editTeam,
  removeTeam,
  moveTeam,
  resetSetup,
  setWinCondition,
  startCreatingNewGame,
  cancelCreatingNewGame,
  setMusicMode,
} = setupSlice.actions;

export default setupSlice.reducer;
