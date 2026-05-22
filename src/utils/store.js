import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "../pages/Game/gameSlice";
import setupReducer from "../pages/Setup/setupSlice";
import { loadState, saveState } from "./persist";

const store = configureStore({
  reducer: {
    setup: setupReducer,
    game: gameReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  const state = store.getState();

  if ((state.game.status === "finished" || state.game.status === "aborted") && state.setup.musicMode !== "spotify") {
    localStorage.removeItem("appState");
    return;
  }

  saveState(state);
});

export default store;
