import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../contexts/useNotify";
import GenreSelector from "../../features/setup/GenreSelector";
import StartGameButton from "../../features/setup/StartGameButton";
import StartTokenSelector from "../../features/setup/StartTokenSelector";
import NewTeamInput from "../../features/setup/NewTeamInput";
import WinnerCardsSelector from "../../features/setup/WinnerCardsSelector";
import YearRangeSelector from "../../features/setup/YearRangeSelector";
import Button from "../../ui/Button";
import { startGame } from "../Game/gameSlice";
import {
  cancelCreatingNewGame,
  resetSetup,
  setGenre,
  setSongsPerYear,
  setWinCondition,
  setYearEnd,
  setYearStart,
  setMusicMode,
} from "./setupSlice";
import TeamList from "../../features/setup/TeamList";
import { selectSongsPerYear } from "../../utils/selectSongsPerYear";
import { redirectToSpotifyLogin } from "../../utils/spotifyAuth";
import SongsPerYearSelector from "../../features/setup/SongsPerYearSelector";
import { useSettings } from "../../contexts/useSettings";

export default function CreateNewGame({ songs }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = useNotify();
  const { loadSettings } = useSettings();

  const inputRef = useRef(null);

  const [startingTokens, setStartingTokens] = useState(3);
  // const [mode, setMode] = useState("qr"); // "spotify" | "qr"

  const genre = useSelector((state) => state.setup.genre ?? []);
  const yearStart = useSelector((state) => state.setup.yearStart);
  const yearEnd = useSelector((state) => state.setup.yearEnd);
  const teams = useSelector((state) => state.setup.teams ?? []);
  const winCondition = useSelector((state) => state.setup.winCondition);
  const songsPerYear = useSelector((state) => state.setup.songsPerYear);
  const musicMode = useSelector((state) => state.setup.musicMode);

  const genres = [...new Set(songs.flatMap((s) => s.chart_name.split(",")).map((g) => g.trim()))];

  const spotifyToken = localStorage.getItem("spotify_access_token");
  const isSpotifyLoggedIn = !!spotifyToken;
  const isStartDisabled = teams.length < 2 || !genre || genre.length === 0 || (musicMode === "spotify" && !isSpotifyLoggedIn);

  const handleStart = () => {
    const filtered = songs.filter((song) => {
      const songGenres = song.chart_name.split(",").map((g) => g.trim());

      const matchesGenre = genre.some((g) => songGenres.includes(g));
      const matchesYearStart = yearStart ? song.year >= Number(yearStart) : true;
      const matchesYearEnd = yearEnd ? song.year <= Number(yearEnd) : true;

      return matchesGenre && matchesYearStart && matchesYearEnd;
    });

    const finalSongs = selectSongsPerYear(filtered, songsPerYear);

    if (!finalSongs.length || finalSongs.length <= teams.length) {
      notify("danger", "No songs match the selected filters.");
      return;
    }

    loadSettings({
      genre,
      yearStart,
      yearEnd,
      winCondition,
      songsPerYear,
    });

    dispatch(resetSetup());
    dispatch(startGame({ songs: finalSongs, teams, startingTokens, winCondition, musicMode }));

    navigate("/game");
  };

  function handleBack() {
    dispatch(resetSetup());
    dispatch(cancelCreatingNewGame());
  }

  return (
    <div className="setup create-new-game">
      <h2 style={{ margin: "auto" }}>Setup the new game</h2>

      <div className="input-fields">
        <div className="first-col">
          <div>
            <h3 className="input-label">Genre</h3>
            <GenreSelector genres={genres} selected={genre} onChange={(list) => dispatch(setGenre(list))} />
          </div>

          <div>
            <h3 className="input-label">Time period</h3>
            <YearRangeSelector
              yearStart={yearStart}
              yearEnd={yearEnd}
              onStartChange={(v) => dispatch(setYearStart(v))}
              onEndChange={(v) => dispatch(setYearEnd(v))}
            />
          </div>

          <div>
            <h3 className="input-label">Songs / year</h3>
            <SongsPerYearSelector value={songsPerYear} onChange={(v) => dispatch(setSongsPerYear(v))} />
          </div>

          <div>
            <h3 className="input-label">Starting tokens</h3>
            <StartTokenSelector startingTokens={startingTokens} setStartingTokens={setStartingTokens} />
          </div>

          <div>
            <h3 className="input-label">Cards to win</h3>
            <WinnerCardsSelector value={winCondition} onChange={(v) => dispatch(setWinCondition(v))} />
          </div>
        </div>

        <div className="second-col">
          <div>
            <h3 className="input-label">New team</h3>
            <NewTeamInput inputRef={inputRef} />
          </div>

          {teams.length > 0 && (
            <div>
              <h3 style={{ marginBottom: "0.25rem" }} className="input-label">
                Teams
              </h3>
              <TeamList inputRef={inputRef} />
            </div>
          )}

          {/*  */}
          <div>
            <h3 className="input-label">Song source</h3>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="radio"
                name="mode"
                value="spotify"
                checked={musicMode === "spotify"}
                onChange={() => dispatch(setMusicMode("spotify"))}
              />
              Spotify
            </label>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="radio" name="mode" value="qr" checked={musicMode === "qr"} onChange={() => dispatch(setMusicMode("qr"))} />
              QR‑kód
            </label>
          </div>

          {musicMode === "spotify" && (
            <>
              {!isSpotifyLoggedIn && <Button onClick={redirectToSpotifyLogin}>Connect Spotify</Button>}

              {isSpotifyLoggedIn && <p style={{ color: "green" }}>Spotify connected ✓</p>}
            </>
          )}
          {/*  */}
        </div>
      </div>

      <div style={{ display: "flex", gap: "2rem", margin: "auto" }}>
        <Button className="secondary-button" onClick={handleBack}>
          Back
        </Button>

        <StartGameButton disabled={isStartDisabled} onClick={handleStart} />
      </div>
    </div>
  );
}
