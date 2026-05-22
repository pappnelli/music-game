import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../contexts/useModal";
import { editTeam as editGameTeam } from "../../pages/Game/gameSlice";
import { editTeam as editSetupTeam } from "../../pages/Setup/setupSlice";
import Button from "../../ui/Button";
import ColorDisplay from "../../ui/ColorDisplay";
import Modal from "../../ui/Modal";
import TextInput from "../../ui/TextInput";
import InGameSettingsModal from "../settings/InGameSettingsModal";

export default function EditTeamModal({ teamId }) {
  const { openModal, closeModal } = useModal();
  const dispatch = useDispatch();

  const teamsInSetup = useSelector((state) => state.setup.teams ?? []);
  const availableSetupColors = useSelector((state) => state.setup.available_colors ?? []);
  const isCreatingNewGame = useSelector((state) => state.setup.isCreatingNewGame);

  const teamsInGame = useSelector((state) => state.game.teams ?? []);
  const availableGameColors = useSelector((state) => state.game.available_colors ?? []);

  const teams = !isCreatingNewGame ? teamsInGame : teamsInSetup;
  const team = teams.find((t) => t.id === teamId);

  const [name, setName] = useState(team.name);
  const [color, setColor] = useState(team.color);

  const handleSave = () => {
    if (!isCreatingNewGame) {
      dispatch(editGameTeam({ id: team.id, name, color }));
      openModal(<InGameSettingsModal />);
    } else {
      dispatch(editSetupTeam({ id: team.id, name, color }));
      closeModal();
    }
  };

  const handleClose = () => {
    if (!isCreatingNewGame) {
      openModal(<InGameSettingsModal />);
    } else {
      closeModal();
    }
  };

  return (
    <Modal onClose={handleClose}>
      <h2>Customize team</h2>

      <div className="setup" style={{ margin: "1rem", display: "flex", flexFlow: "column", gap: "1rem" }}>
        <div>
          <h3 className="input-label">Team name</h3>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" />
        </div>

        <div>
          <h3 className="input-label">Team color</h3>

          <div style={{ display: "flex", gap: "0.5rem", height: "40px", alignItems: "center" }}>
            <ColorDisplay selected={team.color === color} color={team.color} onClick={() => setColor(team.color)} />

            {!isCreatingNewGame
              ? availableGameColors.map((availableColor) => (
                  <ColorDisplay
                    key={availableColor}
                    selected={availableColor === color}
                    color={availableColor}
                    onClick={() => setColor(availableColor)}
                  />
                ))
              : availableSetupColors.map((availableColor) => (
                  <ColorDisplay
                    key={availableColor}
                    selected={availableColor === color}
                    color={availableColor}
                    onClick={() => setColor(availableColor)}
                  />
                ))}
          </div>
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
