import { Plus } from "lucide-react";
import { useState } from "react";
import IconButton from "../../ui/IconButton";
import TextInput from "../../ui/TextInput";

import { useDispatch } from "react-redux";
import { addTeam } from "../../pages/Setup/setupSlice";

export default function NewTeamInput({ inputRef }) {
  const dispatch = useDispatch();
  const [teamInput, setTeamInput] = useState("");

  const handleAddTeam = () => {
    if (teamInput.trim() === "") return;

    dispatch(addTeam(teamInput));
    setTeamInput("");

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", width: "fit-content" }}>
      <TextInput
        ref={inputRef}
        placeholder="Team name"
        value={teamInput}
        onChange={(e) => setTeamInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddTeam();
          }
        }}
      />

      <IconButton onClick={handleAddTeam}>
        <Plus size={16} />
      </IconButton>
    </div>
  );
}
