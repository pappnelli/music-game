import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "idle",
  showSolution: false,
  winCondition: null,
  musicMode: "qr",

  songs: [],
  currentSong: null,
  usedSongs: [],

  tokens: [],
  cardPosition: null,

  teams: [], ///
  currentTeamId: null, ///
  roundWinnerId: null, /// name teamId
  winnerId: null, ///

  available_colors: [],
};

/* function checkWin(state, teamId) {
  if (!teamId) return;
  if (!state.winCondition) return; 

  const cardCount = state.teams.find((t) => t.id === teamId).cards?.length ?? 0;
  if (cardCount >= state.winCondition) {
    state.winnerId = teamId;
    state.status = "finished";
  }
} */

function drawSong(state) {
  if (state.songs.length === 0) {
    state.status = "aborted";
    return;
  }

  const idx = Math.floor(Math.random() * state.songs.length);
  const song = state.songs[idx];

  state.currentSong = song;
  state.showSolution = false;
  state.roundWinnerId = null;

  state.usedSongs.push(song);
  state.songs.splice(idx, 1);

  state.tokens = [];
  state.cardPosition = null;
}

function isCorrectPosition(slotIndex, teamCards, currentSong) {
  if (!currentSong) return false;
  const year = currentSong.year;

  const sortedSongs = [...teamCards].sort((a, b) => a.year - b.year);

  const songCount = sortedSongs.length;

  if (songCount === 0) return true;

  const leftIndex = slotIndex - 1;
  const rightIndex = slotIndex;

  const hasLeft = leftIndex >= 0 && leftIndex < songCount;
  const hasRight = rightIndex >= 0 && rightIndex < songCount;

  if (hasLeft && hasRight) {
    const leftYear = sortedSongs[leftIndex].year;
    const rightYear = sortedSongs[rightIndex].year;
    return leftYear <= year && year <= rightYear;
  }

  if (!hasLeft && hasRight) {
    const rightYear = sortedSongs[rightIndex].year;
    return year <= rightYear;
  }

  if (hasLeft && !hasRight) {
    const leftYear = sortedSongs[leftIndex].year;
    return year >= leftYear;
  }

  return false;
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    placeToken(state, action) {
      const { teamId, position } = action.payload;

      if (teamId === state.currentTeamId) return;

      const usedToken = state.tokens.some((token) => token.teamId === teamId);
      if (usedToken) return;

      const slotTaken = state.tokens.some((token) => token.position === position);
      if (slotTaken) return;

      const team = state.teams.find((t) => t.id === teamId);
      if (!team || team.tokens <= 0) return;

      team.tokens -= 1;

      state.tokens.push({
        teamId,
        position,
      });
    },

    moveToken(state, action) {
      const { teamId, newPosition } = action.payload;

      const slotTaken = state.tokens.some((token) => token.position === newPosition);
      if (slotTaken) return;

      const usedToken = state.tokens.find((token) => token.teamId === teamId);
      if (!usedToken) return;

      usedToken.position = newPosition;
    },

    removeToken(state, action) {
      const { teamId } = action.payload;

      const idx = state.tokens.findIndex((token) => token.teamId === teamId);
      if (idx === -1) return;

      const team = state.teams.find((t) => t.id === teamId);
      if (team) team.tokens += 1;

      state.tokens.splice(idx, 1);
    },

    placeCard(state, action) {
      const { position } = action.payload;

      state.cardPosition = position;
    },

    moveCard(state, action) {
      const { newPosition } = action.payload;
      state.cardPosition = newPosition;
    },

    removeCard(state) {
      state.cardPosition = null;
    },

    startGame(state, action) {
      const { songs, teams, startingTokens, winCondition, musicMode } = action.payload;

      state.status = "playing";
      state.winCondition = winCondition;
      state.musicMode = musicMode;

      let remaining = [...songs];

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

      state.teams = teams.map((team) => {
        let cards = [];

        if (remaining.length > 0) {
          const idx = Math.floor(Math.random() * remaining.length);
          cards.push(remaining[idx]);
          state.usedSongs.push(remaining[idx]);
          remaining.splice(idx, 1);
        }

        const colorIdx = state.available_colors.indexOf(team.color);
        if (colorIdx !== -1) {
          state.available_colors.splice(colorIdx, 1);
        }

        return {
          id: team.id,
          name: team.name,
          color: team.color,
          cards,
          tokens: startingTokens ?? 0,
        };
      });

      state.currentTeamId = state.teams[0]?.id ?? null;

      state.songs = remaining;
      state.currentSong = null;
      state.showSolution = false;
      state.roundWinnerId = null;
      state.tokens = [];
      state.cardPosition = null;
      state.winnerId = null;

      drawSong(state);
    },

    setShowSolution(state, action) {
      const show = action.payload;
      state.showSolution = show;

      if (!show) {
        state.roundWinnerId = null;
        return;
      }

      const currentCards = state.teams.find((t) => t.id === state.currentTeamId)?.cards;

      let roundWinnerId = null;

      if (state.cardPosition != null) {
        if (isCorrectPosition(state.cardPosition, currentCards, state.currentSong)) {
          roundWinnerId = state.currentTeamId;
        }
      }

      if (!roundWinnerId) {
        for (const team of state.teams) {
          if (team.id === state.currentTeamId) continue;

          const token = state.tokens.find((t) => t.teamId === team.id);
          if (!token) continue;

          if (isCorrectPosition(token.position, currentCards, state.currentSong)) {
            roundWinnerId = team.id;
            break;
          }
        }
      }

      state.roundWinnerId = roundWinnerId;
    },

    abortGame() {
      return {
        ...initialState,
        status: "aborted",
      };
    },

    nextRound(state, action) {
      const { tokenWinnerId } = action.payload || "";

      if (state.roundWinnerId && state.currentSong) {
        state.teams.find((t) => t.id === state.roundWinnerId).cards.push(state.currentSong);

        const cardCount = state.teams.find((t) => t.id === state.roundWinnerId).cards?.length ?? 0;
        if (state.winCondition && cardCount >= state.winCondition) {
          state.winnerId = state.roundWinnerId;
          state.status = "finished";
        }
      }

      if (tokenWinnerId && state.teams.find((t) => t.id === tokenWinnerId)) {
        state.teams.find((t) => t.id === tokenWinnerId).tokens += 1;
      }

      state.currentSong = null;
      state.showSolution = false;
      state.roundWinnerId = null;

      const currentIndex = state.teams.findIndex((t) => t.id === state.currentTeamId);
      const nextIndex = (currentIndex + 1) % state.teams.length;
      state.currentTeamId = state.teams[nextIndex].id;

      state.tokens = [];
      state.cardPosition = null;

      if (state.status === "playing") {
        drawSong(state);
      }
    },

    drawNewCard(state) {
      // if (!state.currentSong) return;

      // state.showSolution = false;
      // state.roundWinnerName = null;

      for (const token of state.tokens) {
        if (state.teams.find((t) => t.id === token.teamId)) {
          state.teams.find((t) => t.id === token.teamId).tokens += 1;
        }
      }

      state.tokens = [];
      state.cardPosition = null;

      drawSong(state);
    },

    loadSavedGame(state, action) {
      // return action.payload;

      const saved = action.payload;

      // Ha nincs mentett játék → ne csináljon semmit
      if (!saved) {
        return state;
      }

      return {
        ...state,
        ...saved,
      };
    },
    updateGameSettings(state, action) {
      const { filteredSongs, winCondition } = action.payload;

      const unused = filteredSongs.filter((song) => !state.usedSongs.some((used) => song.id === used.id));

      state.songs = unused;
      state.winCondition = winCondition;
      // talan nem kell ujat huzni
    },
    editTeam(state, action) {
      const { id, name, color } = action.payload;

      const team = state.teams.find((t) => t.id === id);
      if (!team) return;

      if (color && color !== team.color) {
        state.available_colors.push(team.color);

        const idx = state.available_colors.indexOf(color);
        if (idx !== -1) {
          state.available_colors.splice(idx, 1);
        }
      }

      team.name = name;
      team.color = color;
    },
  },
});

export const {
  startGame,
  setShowSolution,
  abortGame,
  placeToken,
  moveToken,
  removeToken,
  placeCard,
  moveCard,
  removeCard,
  nextRound,
  drawNewCard,
  loadSavedGame,
  updateGameSettings,
  editTeam,
} = gameSlice.actions;

export default gameSlice.reducer;
