import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../contexts/useModal";
import { useSettings } from "../../contexts/useSettings";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import GenreSelector from "../setup/GenreSelector";
import WinnerCardsSelector from "../setup/WinnerCardsSelector";
import YearRangeSelector from "../setup/YearRangeSelector";
import InGameTeamList from "./InGameTeamList";
import { updateGameSettings } from "../../pages/Game/gameSlice";
import { useNotify } from "../../contexts/useNotify";
import { selectSongsPerYear } from "../../utils/selectSongsPerYear";
import SongsPerYearSelector from "../setup/SongsPerYearSelector";

export default function InGameSettingsModal() {
  const notify = useNotify();
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const { updateDraft, draftSettings, saveChanges } = useSettings();

  const { genre, yearStart, yearEnd, songsPerYear, winCondition } = draftSettings || {};

  const songs = useSelector((state) => state.setup.songs ?? []);
  const teams = useSelector((state) => state.game.teams ?? []);

  const genres = [...new Set(songs.flatMap((s) => s.chart_name.split(",")).map((g) => g.trim()))];

  function handleSave() {
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

    saveChanges();
    dispatch(
      updateGameSettings({
        filteredSongs: finalSongs,
        winCondition: winCondition,
      }),
    );
    closeModal();
  }

  function handleClose() {
    closeModal();
    /// mikor allitsuk vissza a setup ertekeit ha bezarodik
  }

  return (
    <Modal onClose={handleClose}>
      <h2>Settings</h2>

      <div className="game" style={{ margin: "1rem", display: "flex", flexFlow: "column", gap: "1rem" }}>
        <div>
          <h3 className="input-label">Genre</h3>
          <GenreSelector genres={genres} selected={genre} onChange={(list) => updateDraft({ genre: list })} />
        </div>

        <div>
          <h3 className="input-label">Time period</h3>
          <YearRangeSelector
            yearStart={yearStart}
            yearEnd={yearEnd}
            onStartChange={(v) => updateDraft({ yearStart: v })}
            onEndChange={(v) => updateDraft({ yearEnd: v })}
          />
        </div>

        <div>
          <h3 className="input-label">Songs / year</h3>
          <SongsPerYearSelector value={songsPerYear} onChange={(v) => updateDraft({ songsPerYear: v })} />
        </div>

        <div>
          <h3 className="input-label">Cards to win</h3>
          <WinnerCardsSelector value={winCondition} onChange={(v) => updateDraft({ winCondition: v })} />
        </div>

        <div>
          <h3 style={{ marginBottom: "0.25rem" }} className="input-label">
            Teams
          </h3>
          <InGameTeamList />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Button className="secondary-button" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
}
