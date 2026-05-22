export function loadState() {
  try {
    const serialized = localStorage.getItem("appState");
    if (!serialized) return undefined;

    const state = JSON.parse(serialized);

    if (state.game?.status === "finished" || state.game?.status === "aborted") {
      return undefined;
    }

    return state;
  } catch {
    return undefined;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem("appState", JSON.stringify(state));
  } catch {
    //
  }
}
