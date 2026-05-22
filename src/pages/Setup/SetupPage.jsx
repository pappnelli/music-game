import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadSongs } from "../../services/loadSongs";
import Button from "../../ui/Button";
import { loadState } from "../../utils/persist";
import { loadSavedGame } from "../Game/gameSlice";
import CreateNewGame from "./CreateNewGame";
import { resetSetup, setSongs, startCreatingNewGame } from "./setupSlice";

export default function SetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isCreatingNewGame = useSelector((state) => state.setup.isCreatingNewGame);
  const songs = useSelector((state) => state.setup.songs ?? []);
  const teams = useSelector((state) => state.game.teams ?? []);

  function addSongIds(songs) {
    const counters = {};

    return songs.map((song) => {
      const year = Number(song.year);

      if (!counters[year]) counters[year] = 1;

      const index = counters[year]++;
      const padded = String(index).padStart(3, "0");

      return { ...song, id: `${year}-${padded}` };
    });
  }

  useEffect(() => {
    async function loadXLSX() {
      const json = await loadSongs();

      const songsWithIds = addSongIds(json);

      dispatch(setSongs(songsWithIds));
    }

    loadXLSX();
  }, [dispatch]);

  useEffect(() => {
    const saved = loadState(); // itt kérjük le, nem renderben

    if (saved?.game) {
      dispatch(loadSavedGame(saved?.game));
    }
  }, [dispatch]);

  if (isCreatingNewGame) {
    return <CreateNewGame songs={songs} />;
  }

  return (
    <div
      className="setup"
      style={{
        margin: "0 auto",
        width: "min-content",
        justifyItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      <h1 style={{ margin: "auto" }}>My Hitster</h1>

      <div style={{ display: "flex", gap: "2rem", flexFlow: "column", margin: "auto" }}>
        <Button
          disabled={songs.length === 0}
          className="setup-button"
          onClick={() => {
            dispatch(resetSetup());
            dispatch(startCreatingNewGame());
          }}
        >
          Setup new game
        </Button>
        <Button
          disabled={teams.length === 0}
          className="continue-button"
          onClick={() => {
            navigate("/game");
          }}
        >
          Continue last game
        </Button>
      </div>
    </div>
  );
}
