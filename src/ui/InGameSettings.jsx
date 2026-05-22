import { Settings } from "lucide-react";
import IconButton from "./IconButton";
import InGameSettingsModal from "../features/settings/InGameSettingsModal";
import { useModal } from "../contexts/useModal";
import { useSelector } from "react-redux";
import { useSettings } from "../contexts/useSettings";

export default function InGameSettings() {
  const { openModal } = useModal();
  const { discardChanges } = useSettings();

  const status = useSelector((state) => state.game.status);

  function handleOpen() {
    discardChanges();

    openModal(<InGameSettingsModal />);
  }

  if (status !== "playing") return null;

  return (
    <IconButton
      onClick={handleOpen}
      style={{
        position: "fixed",
        top: "1rem",
        right: "4rem",
        zIndex: 1000,
      }}
      aria-label="Settings"
    >
      <Settings size={16} />
    </IconButton>
  );
}
